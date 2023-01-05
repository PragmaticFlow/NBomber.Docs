---
id: load-simulation
title: Load Simulation
sidebar_position: 2
---

import ScenarioParallelismImage from './img/scenario_parallelism.jpg'; 

<center><img src={ScenarioParallelismImage} width="70%" height="70%" /></center>

When it comes to load simulation(workload profile/concurrency/parallelism), systems behave in 2 different ways:

- Closed systems - where you control the concurrent number of users. It implies that you hold a constant number of users, and them waiting on a response before sending a new request. A good example will be a database with 20 concurrent clients that constantly repeat sending query then wait for a response and do it again. Under the big load, requests will be queued and this queue will not grow since we have a finite number of clients. Usually, in real-world scenarios systems with persisted connections (RabbitMq, Kafka, WebSockets, Databases) are tested as closed systems.

- Open systems - where you control the arrival rate of users. It implies that you hold the arrival rate of users' requests, and they don't wait on a response before sending a new request. The good example could be some popular website like Amazon. Under the load new clients arrive even though applications have trouble serving them. Usually, in real-world scenarios systems that use stateless protocols like HTTP are tested as open systems.

Here is a table of load simulations available in NBomber:

| Load Simulation | Type | Usage |
| - | - | - |
| [RampingConstant](load-simulation#ramping-constant) | Closed systems | Use it for a smooth ramp up and ramp down. Usually, this simulation type is used to test databases, message brokers, or any other system that works with a static client's pool of connections and reuses them. |
| [KeepConstant](load-simulation#keep-constant) | Closed systems | Use it when you need to run and hold a constant amount of Scenario copies(instances) for a specific period. Usually, this simulation type is used to test databases, message brokers, or any other system that works with a static client's pool of connections and reuses them. |
| [RampingInject](load-simulation#ramping-inject) | Open systems | With this simulation, you control the Scenario injection rate and injection interval. Use it for a smooth ramp up and ramp down. Usually, this simulation type is used to test HTTP API. |
| [Inject](load-simulation#inject) | Open systems | With this simulation, you control the Scenario injection rate and injection interval. Use it when you want to maintain a constant rate of requests without being affected by the performance of the system you load test. Usually, this simulation type is used to test HTTP API. |
| [InjectRandom](load-simulation#inject-random) | Open systems | With this simulation, you control the Scenario injection rate and injection interval. Use it when you want to maintain a random rate of requests without being affected by the performance of the system you load test. Usually, this simulation type is used to test HTTP API. |
| [Pause](load-simulation#pause) |  | Introduces Scenario pause for a given duration. It's useful for cases when some Scenario start should be delayed or paused in the middle of execution. |

:::info
Load Simulations can be configured via JSON configuration file.
:::

### Ramping Constant

Adds or removes a given number of Scenario copies(instances) with a linear ramp over a given duration. **Each Scenario copy behaves like a long-running thread that runs some logic in a loop.** In other words, every Scenario copy(instance) will continue to iterate(be reused) during the specified duration. Use it for a smooth ramp up and ramp down. Usually, this simulation type is used to test databases, message brokers, or any other system that works with a static client's pool of connections and reuses them.

**Example**: In this example, we combined two simulations: ramp up from 0 to 50 and ramp down from 50 to 20. The NBomber scheduler will be activated periodically to add a new `Scenario` copy instance into the running `Scenarios pool`. This simulation will continue ramping up copies from 0 to 50 until the end duration. After this, the following simulation will start smoothly ramping down Scenario copies from 50 to 20. 

```csharp
scenario.WithLoadSimulations(
    // ramp up from 0 to 50 copies    
    // duration: 30 seconds (it executes from [00:00:00] to [00:00:30])
    Simulation.RampingConstant(copies: 50, during: TimeSpan.FromSeconds(30)),

    // ramp down from 50 to 20 copies
    // duration: 30 seconds (it executes from [00:00:30] to [00:01:00])
    Simulation.RampingConstant(copies: 20, during: TimeSpan.FromSeconds(30))
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/HelloWorld/HelloWorldExample.cs).*

### Keep Constant

Keeps activated(constantly running) a fixed number of Scenario copies(instances) which executes as many iterations as possible for a specified duration. **Each Scenario copy behaves like a long-running thread that runs some logic in a loop.** In other words, every Scenario copy(instance) will continue to iterate(be reused) during the specified duration. Use it when you need to run and hold a constant amount of Scenario copies(instances) for a specific period. Usually, this simulation type is used to test databases, message brokers, or any other system that works with a static client's pool of connections and reuses them.

**Example 1**: This simulation will create and start 20 Scenario copies and keep them running until the end duration. Each Scenario copy act like a long-running thread that executes some logic in a loop. 

```csharp
scenario.WithLoadSimulations(
    // it creates 20 copies and keeps them running
    // duration: 30 seconds (it executes from [00:00:00] to [00:00:30])
    Simulation.KeepConstant(copies: 20, during: TimeSpan.FromSeconds(30))
);
```

**Example 2**: In this example, we combined three simulations: ramp up from 0 to 50, keeps 50 copies running for 1 minute, and then ramp down from 50 to 0. On the first simulation(`RampingConstant`), the NBomber scheduler will be activated periodically to add a new Scenario copy instance into the running Scenarios pool. This simulation will continue ramping up copies from 0 to 50 until the end duration. After this, the following simulation(`KeepConstant`) will keep the running 50 copies for 1 minute, and then the last simulation(`RampingConstant`) starts smoothly ramping down Scenario copies from 50 to 0. 

```csharp
scenario.WithLoadSimulations(
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

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/HelloWorld/HelloWorldExample.cs).*

### Ramping Inject

Injects a given number of Scenario copies(instances) with a linear ramp over a given duration. **Each Scenario copy behaves like a short-running thread that runs only once and then is destroyed.** With this simulation, you control the Scenario injection rate and injection interval. Use it for a smooth ramp up and ramp down. Usually, this simulation type is used to test HTTP API.

**Example**: In this example, we combined two simulations: ramp up from 0 to 50 and then ramp down from 50 to 20. The NBomber scheduler will be activated every second(by injection interval) to inject a new Scenario copy, then run it once, destroy it afterward, and then repeat such flow for the next(after 1 second) injection phase. This simulation will continue ramping up the injection rate from 0 to 50 until the end duration. After this, the following simulation will start smoothly ramping down the injection rate from 50 to 20.

```csharp
scenario.WithLoadSimulations(    
    
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

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/HelloWorld/LoadSimulation/ScenarioInjectRate.cs).*

### Inject

Injects a given number of Scenario copies(instances) during a given duration. **Each Scenario copy behaves like a short-running thread that runs only once and then is destroyed.** With this simulation, you control the Scenario injection rate and injection interval. Use it when you want to maintain a constant rate of requests without being affected by the performance of the system you load test. Usually, this simulation type is used to test HTTP API.

**Example 1**: This simulation will start injecting Scenario copies at a rate of 50 copies per 1 second for 30 seconds. Each Scenario copy will be executed only once and then destroyed.

```csharp
scenario.WithLoadSimulations(    
    
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
scenario.WithLoadSimulations(
    
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

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/HelloWorld/LoadSimulation/ScenarioInjectRate.cs).*

### Inject Random

Injects a given random number of Scenario copies(instances) during a given duration. **Each Scenario copy behaves like a short-running thread that runs only once and then is destroyed.** With this simulation, you control the Scenario injection rate and injection interval. Use it when you want to maintain a random rate of requests without being affected by the performance of the system you load test. Usually, this simulation type is used to test HTTP API.

**Example**: This simulation will start injecting Scenario copies with a random rate of 50 to 70 copies per 1 second for 30 seconds. Each Scenario copy will be executed only once and then destroyed.

```csharp
scenario.WithLoadSimulations(    
    
    // injects 50-70 copies per 1 second
    // injection interval: 1 second
    // duration: 30 seconds (it executes from [00:00:00] to [00:00:30])
    Simulation.InjectRandom(minRate: 50, 
                            maxRate: 70,
                            interval: TimeSpan.FromSeconds(1),
                            during: TimeSpan.FromSeconds(30))
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/HelloWorld/LoadSimulation/ScenarioInjectRate.cs).*

### Pause

Introduces Scenario pause for a given duration. It's useful for cases when some Scenario start should be delayed or paused in the middle of execution.

**Example**: In this example, we will delay the startup of the Scenario by 10 sec.

```csharp
scenario.WithLoadSimulations(    
    
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

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/HelloWorld/LoadSimulation/DelayedScenarioStart.cs).*