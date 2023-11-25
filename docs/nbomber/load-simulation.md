---
id: load-simulation
title: Load Simulation
sidebar_position: 2
---

import ScenarioParallelismImage from './img/scenario_parallelism.jpg'; 

<center><img src={ScenarioParallelismImage} width="70%" height="70%" /></center>

When it comes to load simulation(workload profile/concurrency/parallelism), systems behave in 2 different ways:

- **Closed systems - where you control the concurrent number of users**. This means maintaining a constant count of virtual users that repetitively send requests in a loop and wait for a response before sending a new request. The subsequent iteration begins only after the previous one concludes. An illustrative example is a database with 20 concurrent clients consistently sending queries, waiting for responses, and repeating the process. In high-load situations, requests may be queued, but the queue won't grow indefinitely since there is a finite number of clients. Typically, systems with persisted connections (such as RabbitMQ, Kafka, WebSockets, Databases) are tested as closed systems. Additionally, a closed system is characterized by capping the number of concurrent users or active connections.

- **Open systems - where you control the arrival rate of users**. It implies that you control the arrival rate of users' requests, and they don't wait for a response before sending a new request. A prime example is a popular website like Amazon, where new clients continue to arrive even when the application faces challenges in serving them under high load. Typically, in real-world scenarios systems that use stateless protocols like HTTP are tested as open systems.

Here is a table of load simulations available in NBomber:

| Load Simulation | Type | Usage |
| - | - | - |
| [RampingConstant](load-simulation#ramping-constant) | Closed systems | Increases or decreases the number of Scenario copies (virtual users) in a linear ramp over a specified duration. **This simulation type is suitable if you require virtual users to gradually increase or decrease during specific time intervals**. Typically, this simulation type is employed to test closed systems where you have control over the concurrent number (not rate) of users or client connections. |
| [KeepConstant](load-simulation#keep-constant) | Closed systems | Maintains a constant number of activated (constantly running) Scenario copies (virtual users) that execute as many iterations as possible within a specified duration. **Use this simulation type when you need to run and sustain a consistent number of scenario copies (virtual users) for a specific period**. Typically, this simulation type is applied to test closed systems where you have control over the concurrent number (not rate) of users or client connections. |
| [IterationsForConstant](load-simulation#iterations-for-constant) | Closed systems | Maintains a constant number of activated (constantly running) Scenario copies (virtual users), which continue executing until a specified iteration count is reached. **This load simulation type is appropriate when you aim for a specific number of virtual users to complete a fixed total number of iterations**. Typically, this simulation type is applied to test closed systems where you have control over the concurrent number (not rate) of users or client connections. |
| [IterationsForInject](load-simulation#iterations-for-inject) | Open systems | Injects a given number of Scenario copies (virtual users) by rate until a specified iteration count. **With this simulation, you control the Scenario injection rate and iteration count**. Use it when you want to maintain a constant rate of requests and run a fixed number of iterations without being affected by the performance of the system you load test. This simulation type is commonly employed for testing websites and HTTP APIs. |
| [RampingInject](load-simulation#ramping-inject) | Open systems | Injects a given number of Scenario copies (virtual users) by rate with a linear ramp over a given duration. **With this simulation, you control the Scenario injection rate and injection interval**. Choose this approach when you aim to sustain a smooth ramp-up and ramp-down of request rates. This simulation type is commonly employed for testing websites and HTTP APIs. |
| [Inject](load-simulation#inject) | Open systems | Injects a given number of Scenario copies (virtual users) by rate during a given duration. **With this simulation, you control the Scenario injection rate and injection interval**. Use it when you want to maintain a constant rate of requests without being affected by the performance of the system you load test. This simulation type is commonly employed for testing websites and HTTP APIs. |
| [InjectRandom](load-simulation#inject-random) | Open systems | Injects a given random number of Scenario copies (virtual users) by rate during a given duration. **With this simulation, you control the Scenario injection rate and injection interval**. Use it when you want to maintain a random rate of requests without being affected by the performance of the system you load test. This simulation type is commonly employed for testing websites and HTTP APIs. |
| [Pause](load-simulation#pause) |  | Introduces Scenario pause for a given duration. It's useful for cases when some Scenario start should be delayed or paused in the middle of execution. |

:::info
Load Simulations can be configured via [JSON Config](json-config) file.
:::

## Ramping Constant
Increases or decreases the number of Scenario copies (virtual users) in a linear ramp over a specified duration. Each Scenario copy (virtual user) behaves like a long-running thread that runs continuously (by specified duration) and will be destroyed when the current load simulation stops.   

#### When to use
This simulation type is suitable if you require virtual users to gradually increase or decrease during specific time intervals. Typically, this simulation type is employed to test closed systems where you have control over the concurrent number (not rate) of users or client connections. Additionally, it is commonly used to test databases, message brokers, or any other system that uses a static client pool of persistent connections and reuses them.

:::info
This load simulation can be mixed with: [[RampingConstant](#ramping-constant), [KeepConstant](#keep-constant), [Pause](#pause)]  
:::

**Example**: In this example, we combined two simulations: ramp up from 0 to 50 and ramp down from 50 to 20. The NBomber scheduler will be activated periodically to add a new `Scenario` copy instance into the running `Scenarios pool`. This simulation will continue ramping up copies from 0 to 50 until the end duration. After this, the following simulation will start smoothly ramping down Scenario copies from 50 to 20. 

```csharp
Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithLoadSimulations(
    // ramp up from 0 to 50 copies    
    // duration: 30 seconds (it executes from [00:00:00] to [00:00:30])
    Simulation.RampingConstant(copies: 50, during: TimeSpan.FromSeconds(30)),

    // ramp down from 50 to 20 copies
    // duration: 30 seconds (it executes from [00:00:30] to [00:01:00])
    Simulation.RampingConstant(copies: 20, during: TimeSpan.FromSeconds(30))
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/HelloWorldExample.cs).*

## Keep Constant
Maintains a constant number of activated (constantly running) Scenario copies (virtual users) that execute as many iterations as possible within a specified duration. Each Scenario copy (virtual user) behaves like a long-running thread that runs continually (by specified duration) and will be destroyed when the current load simulation stops. 

#### When to use
Use this simulation type when you need to run and sustain a consistent number of scenario copies (virtual users) for a specific period. Typically, this simulation type is applied to test closed systems where you have control over the concurrent number (not rate) of users or client connections. It is also often used to test databases, message brokers, or any other system that uses a static client pool of persistent connections and reuses them.

:::info
This load simulation can be mixed with: [[RampingConstant](#ramping-constant), [KeepConstant](#keep-constant), [Pause](#pause)]  
:::

**Example 1**: This simulation will create and start 20 Scenario copies and keep them running until the end duration. Each Scenario copy acts like a long-running thread that executes some logic in a loop. 

```csharp
Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithLoadSimulations(
    // it creates 20 copies and keeps them running
    // duration: 30 seconds (it executes from [00:00:00] to [00:00:30])
    Simulation.KeepConstant(copies: 20, during: TimeSpan.FromSeconds(30))
);
```

**Example 2**: In this example, we combined three simulations: ramp up from 0 to 50, keeps 50 copies running for 1 minute, and then ramp down from 50 to 0. On the first simulation(`RampingConstant`), the NBomber scheduler will be activated periodically to add a new Scenario copy instance into the running Scenarios pool. This simulation will continue ramping up copies from 0 to 50 until the end duration. After this, the following simulation(`KeepConstant`) will keep the running 50 copies for 1 minute, and then the last simulation(`RampingConstant`) starts smoothly ramping down Scenario copies from 50 to 0. 

```csharp
Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithLoadSimulations(
    // ramp up from 0 to 50 copies    
    // duration: 30 seconds (it executes from [00:00:00] to [00:00:30])
    Simulation.RampingConstant(copies: 50, during: TimeSpan.FromSeconds(30)),

    // it keeps 50 copies running
    // duration: 30 seconds (it executes from [00:00:30] to [00:01:00])
    Simulation.KeepConstant(copies: 50, during: TimeSpan.FromSeconds(30))

    // ramp down from 50 to 0 copies
    // duration: 30 seconds (it executes from [00:01:00] to [00:01:30])
    Simulation.RampingConstant(copies: 0, during: TimeSpan.FromSeconds(30))
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/HelloWorldExample.cs).*

## Iterations For Constant
Maintains a constant number of activated (constantly running) Scenario copies (virtual users), which continue executing until a specified iteration count is reached. Each Scenario copy (virtual user) behaves like a long-running thread that runs continually (by specified duration) and will be destroyed when the current load simulation stops. 

#### When to use
This load simulation type is appropriate when you aim for a specific number of virtual users to complete a fixed total number of iterations. Typically, this simulation type is applied to test closed systems where you have control over the concurrent number (not rate) of users or client connections. It can be applied to databases, message brokers, or any other system that uses a static client pool of persistent connections and reuses them. An example use case is quick performance tests in the development build cycle. As developers make changes, they might run the test against the local code to test for performance regressions.

:::info
This load simulation type can't be mixed with any other simulations.
:::

**Example**: This simulation will create and start 100 Scenario copies(virtual users) and keep them running until the iteration count reaches 1000. Each Scenario copy acts like a long-running thread that executes some logic in a loop. 

```csharp
Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithLoadSimulations(
    // it creates 100 copies and keeps them running 
    // until the iteration count reaches 1000    
    Simulation.IterationsForConstant(copies: 100, iterations: 1000)
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/HelloWorldExample.cs).*

## Iterations For Inject
Injects a given number of Scenario copies (virtual users) by rate until a specified iteration count. With this simulation, you control the Scenario injection rate and iteration count. Each Scenario copy (virtual user) behaves like a short-running thread that runs only once and then is destroyed.

#### When to use
Use it when you want to maintain a constant rate of requests and run a fixed number of iterations without being affected by the performance of the system you load test. This simulation type is commonly employed for testing websites and HTTP APIs. An example use case is quick performance tests in the development build cycle. As developers make changes, they might run the test against the local code to test for performance regressions.

:::info
This load simulation type can't be mixed with any other simulations.
:::

**Example**: This simulation will start injecting Scenario copies(virtual users) at a rate of 100 copies per 1 second until the iteration count reaches 1000. Each Scenario copy will be executed only once and then destroyed.

```csharp
Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithLoadSimulations(
    // it creates 100 copies and keeps them running 
    // until the iterations count reaches 1000    
    Simulation.IterationsForInject(rate: 100,
                                   interval: TimeSpan.FromSeconds(1),
                                   iterations: 1000)
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/HelloWorldExample.cs).*

## Ramping Inject
Injects a given number of Scenario copies (virtual users) by rate with a linear ramp over a given duration. With this simulation, you control the Scenario injection rate and injection interval. Each Scenario copy (virtual user) behaves like a short-running thread that runs only once and then is destroyed.

#### When to use
Choose this approach when you aim to sustain a smooth ramp-up and ramp-down of request rates. Usually, this simulation type is used to test Open systems where you control the arrival rate of users. Additionally, this simulation type is commonly employed for testing websites and HTTP APIs.

:::info
This load simulation can be mixed with: [[RampingInject](#ramping-inject), [Inject](#inject), [InjectRandom](#inject-random), [Pause](#pause)]  
:::

**Example**: In this example, we combined two simulations: ramp up from 0 to 50 and then ramp down from 50 to 20. The NBomber scheduler will be activated every second(by injection interval) to inject a new Scenario copy, then run it once, destroy it afterward, and then repeat such flow for the next(after 1 second) injection phase. This simulation will continue ramping up the injection rate from 0 to 50 until the end duration. After this, the following simulation will start smoothly ramping down the injection rate from 50 to 20.

```csharp
Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithLoadSimulations(    
    
    // ramp up the injection rate from 0 to 50
    // injection interval: 1 second
    // duration: 30 seconds (it executes from [00:00:00] to [00:00:30])
    Simulation.RampingInject(rate: 50, 
                             interval: TimeSpan.FromSeconds(1),
                             during: TimeSpan.FromSeconds(30))

    // ramp down the injection rate from 50 to 20
    // injection interval: 1 second
    // duration: 30 seconds (it executes from [00:00:30] to [00:01:00])
    Simulation.RampingInject(rate: 20, 
                             interval: TimeSpan.FromSeconds(1),
                             during: TimeSpan.FromSeconds(30))
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/LoadSimulation/ScenarioInjectRate.cs).*

## Inject
Injects a given number of Scenario copies (virtual users) by rate during a given duration. With this simulation, you control the Scenario injection rate and injection interval. Each Scenario copy (virtual user) behaves like a short-running thread that runs only once and then is destroyed.

#### When to use
Use it when you want to maintain a constant rate of requests without being affected by the performance of the system you load test. Usually, this simulation type is used to test Open systems where you control the arrival rate of users. Additionally. it is used to test Websites, HTTP API.

:::info
This load simulation can be mixed with: [[RampingInject](#ramping-inject), [Inject](#inject), [InjectRandom](#inject-random), [Pause](#pause)]  
:::

**Example 1**: This simulation will start injecting Scenario copies at a rate of 50 copies per 1 second for 30 seconds. Each Scenario copy will be executed only once and then destroyed.

```csharp
Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithLoadSimulations(    
    
    // injects 50 copies per 1 second
    // injection interval: 1 second
    // duration: 30 seconds (it executes from [00:00:00] to [00:00:30])
    Simulation.Inject(rate: 50, 
                      interval: TimeSpan.FromSeconds(1),
                      during: TimeSpan.FromSeconds(30))
);
```

**Example 2**: In this example, we combined three simulations: ramp up from 0 to 50, keep the injection rate at 50 for 1 minute, and then ramp down from 50 to 0. On the first simulation(`RampingInject`), the NBomber scheduler will be activated every second(by injection interval) to inject a new Scenario copy. This simulation will continue ramping up the injection rate from 0 to 50 until the end duration. After this, the following simulation(`Inject`) will keep injecting with the injection rate of 50 copies per 1 sec for 1 minute, and then the last simulation(`RampingInject`) starts smoothly ramping down the injection rate from 50 to 0 copies. 

```csharp
Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithLoadSimulations(
    
    // ramp up the injection rate from 0 to 50 copies
    // injection interval: 1 second
    // duration: 30 seconds (it executes from [00:00:00] to [00:00:30])
    Simulation.RampingInject(rate: 50, 
                             interval: TimeSpan.FromSeconds(30),
                             during: TimeSpan.FromSeconds(30)),

    // keeps injecting 50 copies per 1 second
    // injection interval: 1 second
    // duration: 30 seconds (it executes from [00:00:30] to [00:01:00])
    Simulation.Inject(rate: 50, 
                      interval: TimeSpan.FromSeconds(30),
                      during: TimeSpan.FromSeconds(30)),

    // ramp down the injection rate from 50 to 0 copies
    // injection interval: 1 second
    // duration: 30 seconds (it executes from [00:01:00] to [00:01:30])
    Simulation.RampingInject(rate: 0, 
                             interval: TimeSpan.FromSeconds(30),
                             during: TimeSpan.FromSeconds(30))
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/LoadSimulation/ScenarioInjectRate.cs).*

## Inject Random
Injects a given random number of Scenario copies (virtual users) by rate during a given duration. With this simulation, you control the Scenario injection rate and injection interval. Each Scenario copy(virtual user) behaves like a short-running thread that runs only once and then is destroyed. 

#### When to use
Use it when you want to maintain a random rate of requests without being affected by the performance of the system you load test. Usually, this simulation type is used to test Open systems where you control the arrival rate of users. Additionally. it is used to test Websites, HTTP API.

:::info
This load simulation can be mixed with: [[RampingInject](#ramping-inject), [Inject](#inject), [InjectRandom](#inject-random), [Pause](#pause)]  
:::

**Example**: This simulation will start injecting Scenario copies with a random rate of 50 to 70 copies per 1 second for 30 seconds. Each Scenario copy will be executed only once and then destroyed.

```csharp
Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithLoadSimulations(    
    
    // injects 50-70 copies per 1 second
    // injection interval: 1 second
    // duration: 30 seconds (it executes from [00:00:00] to [00:00:30])
    Simulation.InjectRandom(minRate: 50, 
                            maxRate: 70,
                            interval: TimeSpan.FromSeconds(1),
                            during: TimeSpan.FromSeconds(30))
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/LoadSimulation/ScenarioInjectRate.cs).*

## Pause

Introduces Scenario pause for a given duration. It's useful for cases when some Scenario start should be delayed or paused in the middle of execution.

**Example**: In this example, we will delay the startup of the Scenario by 10 sec.

```csharp
Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithLoadSimulations(    
    
    // delays the startup
    // duration: 10 seconds (it executes from [00:00:00] to [00:00:10])
    Simulation.Pause(during: TimeSpan.FromSeconds(10))

    // injects 50 copies per 1 second
    // injection interval: 1 second
    // duration: 30 seconds (it executes from [00:00:10] to [00:00:40])
    Simulation.Inject(rate: 50, 
                      interval: TimeSpan.FromSeconds(1),
                      during: TimeSpan.FromSeconds(30))    
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/LoadSimulation/DelayedScenarioStart.cs).*