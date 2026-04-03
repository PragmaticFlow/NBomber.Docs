---
id: load-simulation
title: Load Simulation
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import ScenarioParallelismImage from './img/scenario_parallelism.jpg'; 
import ClosedModelImage from './img/closed_model.jpg'; 
import OpenModelImage from './img/open_model.jpg'; 

<center><img src={ScenarioParallelismImage} width="70%" height="70%" /></center>

When it comes to load simulation (workload profile/concurrency/parallelism), systems may behave in multiple different ways, but usually it can be a mix of Open model and Closed model.

## Open model

Open model (Constant Arrival Rate) - New virtual users keep arriving regardless of the current number of concurrent virtual users. 

:::info
**Use if:** 
- Your system receives independent requests at a steady rate, regardless of how many requests are currently being processed.
- Users enter the system regardless of its current state, meaning the system continuously receives new requests at varying rates.
- The focus is on the rate of incoming requests rather than the number of concurrent users

**Avoid if:** 
- Your system involves user sessions, dependencies between actions or transactional workflows (login → search → checkout).

**Example:** news sites, google search, content delivery networks (CDNs).
:::

In an Open model, new requests of work arrive regardless of whether the system is already processing something else. Users will send requests to the server regardless of how many other requests (from other users) the server is already processing. It implies that you control the arrival rate of users requests, and they don't wait for a response before sending a new request. 

## Closed model

Closed model (User Concurrency) - New virtual users are queued when the system reaches its max capacity.

:::info
**Use if:**
- Your system follows a transactional flow where users perform actions step by step (login → search → checkout).
- The system can only handle a limited number of concurrent users, and new users must wait if capacity is reached.
- The maximum number of concurrent users is predetermined and remains constant throughout the test.
- Suitable for applications where user numbers are controlled and relatively stable.
- The focus is on the number of simultaneous users and how the application manages ongoing user sessions.

**Avoid if:** 
- You need to simulate a constant incoming request rate regardless of system state.

**Example:** majority of real-world applications where users go through a transactional user flow: github, E-commerce platforms, banking systems, ticketing websites.
:::

In a Closed model, the system processes a new request only after completing the previous one. Each virtual user performs a series of tasks (or a single task) before exiting the system. When the system reaches its capacity, additional virtual users are queued and can only enter once others have exited.

## Which model should I use for testing my system?

Each model represents a different method for simulating user activity, and understanding their differences is crucial for choosing the right model for your testing requirements. Systems may behave in multiple different ways, but usually it can be a mix of Open model and Closed model. 

- By default, the `Closed model` is recommended for testing user journey flows. If you’re unsure, a Closed model is often the safest starting point for simulating real-world user behavior. The key point is to gradually increase the number of users to ensure independent behavior among virtual users.
- If your system represents a public website with highly fluctuating user traffic, you may want to consider using the `Open model`, at least for certain endpoints. Additionally, part of your system may include functionality that isn't directly used by real users, such as high-volume background APIs for third-party system integrations, message queues (Kafka, RabbitMQ, MQTT), or other independent processes. 
:::warning
The issue with testing systems using a **purely Open model** is that its applicability is limited. The only way to maintain a constant request rate (RPS) is if each request is entirely independent of others—for example, idempotent requests, simple input-output APIs, and similar cases. While such systems are common, most real-world applications are `transactional`. That is:
- a user performs action A
- waits for a response
- then proceeds to action B and depending on the outcome of B
- they may take action C or D
:::

## Load Simulations

Here is a list of load simulations available in NBomber.

Open model (Constant Arrival Rate):
- [Ramping Inject](#ramping-inject) - Gradually increasing or decreasing the virtual user arrival rate.
- [Inject](#inject) - Maintains a constant arrival rate of virtual users.
- [Inject Random](#inject-random) - Injects virtual users at a random arrival rate within a defined min and max range.
- [Iterations For Inject](#iterations-for-inject) - Injects virtual users at a specified arrival rate until the target iteration count is reached.

<center><img src={OpenModelImage} width="90%" height="90%" /></center>

Closed model (User Concurrency):
- [Ramping Constant](#ramping-constant) - Gradually increasing or decreasing virtual users based on a specified count.
- [Keep Constant](#keep-constant) - Maintains a constant number of activated (constantly running) virtual users that execute as many iterations as possible within a specified duration.
- [Iterations For Constant](#iterations-for-constant) - Maintains a constant number of activated (constantly running) virtual users, which continue executing until a specified iteration count is reached.

<center><img src={ClosedModelImage} width="90%" height="90%" /></center>

[Pause](#pause) - Introduces Scenario start delay or pause for a given duration.

:::info
In a load test, you can run parallel scenarios using both the Open and Closed models within a single test.

Load Simulations can be configured via [JSON Config](#loadsimulation-in-json-config) file.
:::

### Ramping Constant
Gradually increasing or decreasing virtual users (Scenario instances) based on a specified count. Each Scenario instance behaves like a long-running thread that runs continuously (by specified duration) and will be destroyed when the current load simulation stops.   

#### When to use
This simulation type is suitable if you require virtual users to gradually increase or decrease during specific time intervals. Typically, this simulation type is employed to test Closed model where you have control over the concurrent number (not rate) of virtual users or client connections.

:::info
This LoadSimulation can be mixed with: [[RampingConstant](#ramping-constant), [KeepConstant](#keep-constant), [Pause](#pause)]  
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

### Keep Constant
Maintains a constant number of activated (constantly running) virtual users (Scenario instance) that execute as many iterations as possible within a specified duration. Each Scenario instance behaves like a long-running thread that runs continually by specified duration and will be destroyed when the current load simulation stops. 

#### When to use
Use this simulation type when you need to run and sustain a consistent number of virtual users for a specific period. Typically, this simulation type is applied to test Closed model where you have control over the concurrent number (not rate) of virtual users or client connections.

:::info
This LoadSimulation can be mixed with: [[RampingConstant](#ramping-constant), [KeepConstant](#keep-constant), [Pause](#pause)]  
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

**Example 2**: In this example, we combined three simulations: ramp up from 0 to 50, keeps 50 copies running for 30 seconds, and then ramp down from 50 to 0. On the first simulation(`RampingConstant`), the NBomber scheduler will be activated periodically to add a new Scenario copy instance into the running Scenarios pool. This simulation will continue ramping up copies from 0 to 50 until the end duration. After this, the following simulation(`KeepConstant`) will keep the running 50 copies for 30 seconds, and then the last simulation(`RampingConstant`) starts smoothly ramping down Scenario copies from 50 to 0.

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

### Iterations For Constant
Maintains a constant number of activated (constantly running) virtual users (Scenario instances), which continue executing until a specified iteration count is reached. Each Scenario instance behaves like a long-running thread that runs continually by specified duration and will be destroyed when the current load simulation stops. 

#### When to use
This load simulation type is appropriate when you aim for a specific number of virtual users to complete a fixed total number of iterations. Typically, this simulation type is applied to test Closed model where you have control over the concurrent number (not rate) of users or client connections. An example use case is quick performance tests in the development build cycle. As developers make changes, they might run the test against the local code to test for performance regressions.

:::warning
This LoadSimulation type can't be mixed with any other simulations. You can use it only as a single simulation type.
:::

**Example**: This simulation will create and start 100 Scenario copies(virtual users) and keep them running until the iteration count reaches 1000. Each Scenario copy acts like a long-running thread that executes some logic in a loop. 

```csharp
Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithLoadSimulations(
    // it creates 100 copies of virtual user(Scenario instance) and keeps them running 
    // until the iteration count reaches 1000    
    Simulation.IterationsForConstant(copies: 100, iterations: 1000)
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/HelloWorldExample.cs).*

### Ramping Inject
Gradually increasing or decreasing the virtual user (Scenario instance) arrival rate over a specified duration. Each Scenario instance behaves like a short-running thread that runs only once and then is destroyed.

#### When to use
Choose this approach when you aim to sustain a smooth ramp-up and ramp-down of request rates. Usually, this simulation type is used to test Open model where you control the arrival rate of requests.

:::info
This LoadSimulation can be mixed with: [[RampingInject](#ramping-inject), [Inject](#inject), [InjectRandom](#inject-random), [Pause](#pause)]  
:::

**Example**: In this example, we combined two simulations: ramp up from 0 to 50 and then ramp down from 50 to 20. The NBomber scheduler will be activated every second (by injection interval) to inject a new Scenario instance, then run it once, destroy it afterward, and then repeat such flow for the next (after 1 second) injection phase. This simulation will continue ramping up the injection rate from 0 to 50 until the end duration. After this, the following simulation will start smoothly ramping down the injection rate from 50 to 20.

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

### Inject
Maintains a constant arrival rate of virtual users (Scenario instances) during a given duration. Each Scenario instance behaves like a short-running thread that runs only once and then is destroyed.

#### When to use
Use it when you want to maintain a constant rate of requests without being affected by the performance of the system you load test. Usually, this simulation type is used to test Open model where you control the arrival rate of requests.

:::info
This LoadSimulation can be mixed with: [[RampingInject](#ramping-inject), [Inject](#inject), [InjectRandom](#inject-random), [Pause](#pause)]  
:::

**Example 1**: This simulation will start injecting Scenario instances at a rate of 50 copies per 1 second for 30 seconds. Each Scenario instance will be executed only once and then destroyed.

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

**Example 2**: In this example, we combined three simulations: ramp up from 0 to 50, keep the injection rate at 50 for 30 seconds, and then ramp down from 50 to 0. On the first simulation(`RampingInject`), the NBomber scheduler will be activated every second(by injection interval) to inject a new Scenario instance. This simulation will continue ramping up the injection rate from 0 to 50 until the end duration. After this, the following simulation(`Inject`) will keep injecting with the injection rate of 50 copies per 1 sec for 30 seconds, and then the last simulation(`RampingInject`) starts smoothly ramping down the injection rate from 50 to 0 copies. 

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

### Inject Random
Injects virtual users (Scenario instances) at a random arrival rate within a defined min and max range during a given duration. Each Scenario instance behaves like a short-running thread that runs only once and then is destroyed. 

#### When to use
Use it when you want to maintain a random rate of requests without being affected by the performance of the system you load test. Usually, this simulation type is used to test Open model where you control the arrival rate of requests.

:::info
This LoadSimulation can be mixed with: [[RampingInject](#ramping-inject), [Inject](#inject), [InjectRandom](#inject-random), [Pause](#pause)]  
:::

**Example**: This simulation will start injecting Scenario instances with a random rate of 50 to 70 copies per 1 second for 30 seconds. Each Scenario instance will be executed only once and then destroyed.

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

### Iterations For Inject
Injects virtual users (Scenario instances) at a specified arrival rate until the target iteration count is reached. Each Scenario instance behaves like a short-running thread that runs only once and then is destroyed.

#### When to use
Use it when you want to maintain a constant rate of requests and run a fixed number of iterations without being affected by the performance of the system you load test. This simulation type is used to test Open model where you control the arrival rate of requests. An example use case is quick performance tests in the development build cycle. As developers make changes, they might run the test against the local code to test for performance regressions.

:::warning
This LoadSimulation type can't be mixed with any other simulations. You can use it only as a single simulation type.
:::

**Example**: This simulation will start injecting virtual users (Scenario instances) at a rate of 100 copies per 1 second until the iteration count reaches 1000. Each Scenario instance will be executed only once and then destroyed.

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

### Pause

Introduces Scenario start delay or pause for a given duration. It's useful for cases when some Scenario start should be delayed or paused in the middle of execution.

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

## LoadSimulation in JSON Config

Load Simulations can be configured via [JSON Config](json-config) file.

Example 1: configuration for KeepConstant (Closed model), where we control the number of concurrent users.

<Tabs>
<TabItem value="JSON" label="JSON" default>

```json
{
  "GlobalSettings": {    
    
    "ScenariosSettings": [
      {
          "ScenarioName": "scenario",          

          "LoadSimulationsSettings": [
              { "RampingConstant": [50, "00:00:30"] },
              { "KeepConstant": [50, "00:00:30"] },
              { "RampingConstant": [0, "00:00:30"] }
          ]
      }
    ]

  }
}
```

</TabItem>

<TabItem value="C#" label="C#">

```csharp
.WithLoadSimulations(    
    Simulation.RampingConstant(copies: 50, during: TimeSpan.FromSeconds(30)), // ramping up to 50   
    Simulation.KeepConstant(copies: 50, during: TimeSpan.FromSeconds(30))     // keep 50
    Simulation.RampingConstant(copies: 0, during: TimeSpan.FromSeconds(30))   // ramping down to 0
);
```

</TabItem>
</Tabs>

Example 2: configuration for Inject (Open model), where we control the rate.

<Tabs>
<TabItem value="JSON" label="JSON" default>

```json
{
  "GlobalSettings": {    
    
    "ScenariosSettings": [
      {
          "ScenarioName": "scenario",          

          "LoadSimulationsSettings": [              
              { "RampingInject": [50, "00:00:01", "00:00:30"] },
              { "Inject": [50, "00:00:01", "00:00:30"] },
              { "RampingInject": [0, "00:00:01", "00:00:30"] }
          ]
      }
    ]

  }
}
```

</TabItem>

<TabItem value="C#" label="C#">

```csharp
.WithLoadSimulations(    
    
    // ramping up to rate: 50   
    Simulation.RampingInject(rate: 50, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(30)), 

    // keep rate: 50   
    Simulation.Inject(rate: 50, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(30))

    // ramping down to rate: 0
    Simulation.RampingConstant(rate: 0, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(30))
);
```

</TabItem>
</Tabs>
