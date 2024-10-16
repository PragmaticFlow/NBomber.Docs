---
id: dynamic-workloads
title: Dynamic Workloads
sidebar_position: 11
---

import WorkloadsImage from './img/workloads.jpg'; 
import MultipleScenariosImage from './img/multiple_scenarios.jpg'; 
import UniformImage from './img/uniform_distribution.jpg'; 
import ZipfImage from './img/zipf_distribution.jpg'; 
import MultinominalImage from './img/multinomial.jpg'; 

<center><img src={WorkloadsImage} width="80%" height="80%" /></center>

NBomber can schedule different load patterns to simulate dynamic workloads. A test with multiple workloads might better simulate traffic in the real world, where user behavior is rarely uniform. For example, most traffic to a bookstore website might come from users who only search for books and read reviews. A small percentage of thouse users might actively shop, performing actions that involve writes to the database and calls to different APIs.

The following sections provide examples of how to structure NBomber load tests to simulate dynamic workloads.

## Run multiple scenarios in parallel

<center><img src={MultipleScenariosImage} width="40%" height="40%" /></center>

One way to distribute traffic is to use parallel scenarios to schedule different workloads. For example, imagine a website that typically receives 100 concurrent users. Of those, 70 might visit their home page, and 30 might view their profile page. To configure such a distribution, make two scenarios with different throughput or virtual users.

```csharp
var scenario1 = Scenario.Create("home_page", async context =>
{
    /// some logic        
    await Task.Delay(1_000);
    
    return Response.Ok();
})
.WithLoadSimulations(
    Simulation.KeepConstant(copies: 70, during: TimeSpan.FromSeconds(30))
);

var scenario2 = Scenario.Create("user_profile", async context =>
{
    /// some logic    
    await Task.Delay(1_000);
    
    return Response.Ok();
})
.WithLoadSimulations(
    Simulation.KeepConstant(copies: 30, during: TimeSpan.FromSeconds(30))
);

NBomberRunner
    .RegisterScenarios(scenario1, scenario2)
    .Run();
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/LoadSimulation/ParallelScenarios.cs).*

## Randomize behavior

With NBomber you have several options to introduce randomize behaviour to simulate dynamic workload.

- [Scenario invocation by Weight probability](#scenario-invocation-by-weight-probability)
- Introduce workload randomness using the InjectRandom simulation: [InjectRandom](load-simulation#inject-random)
- [Step invocation by Scenario.InstanceNumber](#step-invocation-by-scenarioinstancenumber)
- [Step invocation by probability distributions](#step-invocation-by-probability-distributions)

### Scenario invocation by Weight probability

With NBomber, you have an option to specify **Weight** for each Scenario. The Weight value allows you to control the relative frequency or probability of Scenario's execution. Scenarios with higher weights will run more frequently during the test, while those with lower weights will execute less often, providing flexible control over load distribution. NBomber uses the weights to determine the probability of each Scenario.

Example: In this case, the `"read_scenario"` probability is 80%, and `"write_scenario"` is 20%.

```csharp
var readScenario = Scenario.Create("read_scenario", async context =>
{
    await Task.Delay(100);
    return Response.Ok();
})
.WithLoadSimulations(
    Simulation.Inject(rate: 10, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(30))
)
.WithWeight(80); // sets 80%

var writeScenario = Scenario.Create("write_scenario", async context =>
{
    await Task.Delay(100);
    return Response.Ok();
})
.WithLoadSimulations(
    Simulation.Inject(rate: 10, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(30))
)
.WithWeight(20); // sets 20%

NBomberRunner
    .RegisterScenarios(readScenario, writeScenario)
    .Run();
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DynamicWorkload/ScenarioWeightExample.cs)*.

:::info
- Scenarios with Weight should always have the same LoadSimulation settings. 

```csharp
var scenario1 = Scenario
    .Create(...)
    .WithWeight(80)
    .WithLoadSimulations(
        // we use the same LoadSimulation settings
        Simulation.Inject(rate: 10, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(30))
    );

var scenario2 = Scenario
    .Create(...)
    .WithWeight(20)
    .WithLoadSimulations(
        // we use the same LoadSimulation settings
        Simulation.Inject(rate: 10, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(30))
    );
```

- NBomber session can include a combination of regular scenarios and scenarios with assigned Weight(s).

```csharp
var regularScenario1 = Scenario
    .Create(...);

var regularScenario2 = Scenario
    .Create(...);    

var scenarioWeight1 = Scenario
    .Create(...)
    .WithWeight(80);   

var scenarioWeight2 = Scenario
    .Create(...)
    .WithWeight(20);

// regularScenario1, regularScenario2 - will run all the time (100%)
// scenarioWeight1, scenarioWeight2 - will run with probability: 80% and 20% 
NBomberRunner
    .RegisterScenarios(regularScenario1, regularScenario2, scenarioWeight1, scenarioWeight2)
    .Run();
```
:::

### Step invocation by Scenario.InstanceNumber

With NBomber, you can distribute logic across a range of Scenario's instances/copies.

```csharp
var scenario = Scenario.Create("home_page", async context =>
{
    if (context.ScenarioInfo.InstanceNumber % 9 < 3)
    {
        // 0-2 range, run step 1
        Step.Run("step_1", ...)
    }
    else if (context.ScenarioInfo.InstanceNumber % 9 < 6)
    {
        // 3-5 range, run step 2
        Step.Run("step_2", ...)
    }
    else
    {
        // 6-8 range, run step 3
        Step.Run("step_3", ...)
    }
})
.WithLoadSimulations(
    Simulation.KeepConstant(copies: 9, during: TimeSpan.FromSeconds(30))
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DynamicWorkload/InstanceNumberDistributionExample.cs).*

## Step invocation by probability distributions

To simulate a truly dynamic workload, your load test must make many random choices when generating load. Which operation to perform? For example: Insert, Update, Read or Delete, and so on. These decisions can be governed by probability distributions: 

- Uniform: Select an item randomly and uniformly. For instance, when picking a record, every record in the database has an equal chance of being selected.

- Zipfian: Choose an item according to the Zipfian distribution. For example, when choosing a record, some records will be extremely popular (the head) while most records will be unpopular (the tail).

- Multinomial: Specify probabilities for each item. For example, assigning a probability of 0.95 to the Read operation, 0.05 to the Update operation, and 0 to Delete and Insert. This setup creates a read-heavy workload.

### Uniform distribution

<center><img src={UniformImage} width="30%" height="30%" /></center>

Select an item randomly and uniformly. For instance, when picking a record, every record in the database has an equal chance of being selected. To simulate Uniform distribution we can use *System.Random* type that is provided by *IScenarioContext.Random*.

:::info
If you want to get numbers say from 1 to 10 (including 10) you should use:

```csharp
// minValue: inclusive lower bound value
// maxValue: exclusive upper bound value
context.Random.Next(minValue: 1, maxValue: 11);
```
:::

```csharp
var scenario = Scenario.Create("home_page", async context =>
{
    // context.Random: System.Random
    var stepNumber = context.Random.Next(minValue: 1, maxValue: 11);
    switch (stepNumber)
    {
        case 1: // run step 1
            Step.Run("step_1", ...);
            break;

        case 2: // run step 2
            Step.Run("step_2", ...);
            break;
        
        ...
    }
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DynamicWorkload/UniformDistributionExample.cs).*

### Zipfian distribution

<center><img src={ZipfImage} width="30%" height="30%" /></center>

Choose an item according to the Zipfian distribution. For example, when choosing a record, some records will be extremely popular (the head) while most records will be unpopular (the tail). The Zipf distribution is a mathematical concept that describes the frequency of items ranked from most common to least common in a dataset, like word frequencies in a book or city populations. Also, this distribution can be used to describe hot keys/items in database or popular tweets in Tweeter web service. To simulate Zipfian distribution we can use extension method Zipf for Random object.

```csharp
var scenario = Scenario.Create("zipfian_distribution", async context =>
{    
    var stepNumber = context.Random.Zipf(n: 5, s: 1.3);

    switch (stepNumber)
    {
        case 1: // run step 1
            Step.Run("step_1", ...);
            break;

        case 2: // run step 2
            Step.Run("step_2", ...);
            break;
        
        ...
    }
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DynamicWorkload/ZipfianDistributionExample.cs).*

### Multinomial distribution

<center><img src={MultinominalImage} width="25%" height="25%" /></center>

Specify probabilities for each item. For example, assigning a probability of 0.95 to the Read operation, 0.05 to the Update operation, and 0 to Delete and Insert. This setup creates a read-heavy workload. To simulate Multinomial distribution we can use extension method Choice for Random object.

**Example**: Let's model a situation where we need a probability of 70% for the Read operation, 20% for the Write operation, and 10% for Delete.

```csharp
// 70% for read, 20% for write, 10% for delete
var items = new [] { ("read", 70), ("write", 20), ("delete", 10) };

var scenario = Scenario.Create("multinomial_distribution", async context =>
{    
    var randomItem = context.Random.Choice(items);
    switch (randomItem)
    {
        case "read": // 70% for read
            Step.Run("read", ...);            
            break;

        case "write": // 20% for write
            Step.Run("write", ...);
            break;

        case "delete": // 10% for delete
            Step.Run("delete", ...);
            break;
    }
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DynamicWorkload/MultinomialDistributionExample.cs).*