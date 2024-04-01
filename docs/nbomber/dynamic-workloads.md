---
id: dynamic-workloads
title: Dynamic Workloads
sidebar_position: 10
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

- Use of LoadSimulation with random injection: [InjectRandom](load-simulation#inject-random)
- [Distribute logic by ThreadNumber](#distribute-logic-by-threadnumber)
- [Distribute logic by probability](#distribute-logic-by-probability)

### Distribute logic by ThreadNumber

With NBomber, you can distribute logic across a range of ThreadNumber.

```csharp
var scenario = Scenario.Create("home_page", async context =>
{
    if (context.ScenarioInfo.ThreadNumber % 9 < 3)
    {
        // 0-2 range, run step 1
    }
    else if (context.ScenarioInfo.ThreadNumber % 9 < 6)
    {
        // 3-5 range, run step 2
    }
    else
    {
        // 6-8 range, run step 3
    }
})
.WithLoadSimulations(
    Simulation.KeepConstant(copies: 9, during: TimeSpan.FromSeconds(30))
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DynamicWorkload/ThreadIdDistributionExample.cs).*

## Distribute logic by probability

To simulate a truly dynamic workload, your load test must make many random choices when generating load. Which operation to perform? For example: Insert, Update, Read or Delete, and so on. These decisions can be governed by probability distributions: 

- Uniform: Select an item randomly and uniformly. For instance, when picking a record, every record in the database has an equal chance of being selected.

- Zipfian: Choose an item according to the Zipfian distribution. For example, when choosing a record, some records will be extremely popular (the head) while most records will be unpopular (the tail).

- Multinomial: Specify probabilities for each item. For example, assigning a probability of 0.95 to the Read operation, 0.05 to the Update operation, and 0 to Delete and Insert. This setup creates a read-heavy workload.

:::info
To start working with probabilities, you should install [MathNet.Numerics](https://www.nuget.org/packages/MathNet.Numerics) package. It's a free package that [contains](https://numerics.mathdotnet.com/Probability) many useful probabilies.

```
dotnet add package MathNet.Numerics
```
:::

### Uniform distribution

<center><img src={UniformImage} width="30%" height="30%" /></center>

Select an item randomly and uniformly. For instance, when picking a record, every record in the database has an equal chance of being selected. To simulate Uniform distribution we can use *System.Random* type that is provided by *IScenarioContext.Random*.

```csharp
var scenario = Scenario.Create("home_page", async context =>
{
    // context.Random: System.Random
    var stepNumber = context.Random.Next(minValue: 1, maxValue: 10);
    switch (stepNumber)
    {
        case 1: // run step 1
            break;
        case 2: // run step 2
            break;
        
        ...
    }
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DynamicWorkload/UniformDistributionExample.cs).*

### Zipfian distribution

<center><img src={ZipfImage} width="30%" height="30%" /></center>

Choose an item according to the Zipfian distribution. For example, when choosing a record, some records will be extremely popular (the head) while most records will be unpopular (the tail). To simulate Zipfian distribution we can use *MathNet.Numerics.Distributions.Zipf* type that is provided by *MathNet.Numerics* package.

```csharp
using MathNet.Numerics.Distributions;

var scenario = Scenario.Create("home_page", async context =>
{    
    var stepNumber = Zipf.Sample(s: 1.3, n: 10, rnd: context.Random);
    switch (stepNumber)
    {
        case 1: // run step 1
            break;
        case 2: // run step 2
            break;
        
        ...
    }
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DynamicWorkload/ZipfianDistributionExample.cs).*

### Multinomial distribution

<center><img src={MultinominalImage} width="25%" height="25%" /></center>

Specify probabilities for each item. For example, assigning a probability of 0.95 to the Read operation, 0.05 to the Update operation, and 0 to Delete and Insert. This setup creates a read-heavy workload. To simulate Multinomial distribution we can use *MathNet.Numerics.Distributions.Multinomial* type that is provided by *MathNet.Numerics* package. 

**Example**: Let's model a situation where we need a probability of 70% for the Read operation, 20% for the Write operation, and 10% for Delete.

```csharp
using MathNet.Numerics.Distributions;

var ratios = new[] {0.7, 0.2, 0.1}; // 70%, 20%, 10%

var scenario = Scenario.Create("home_page", async context =>
{    
    int[] result = Multinomial.Sample(context.Random, ratios, 1);    

    if (result[0] == 1)
    {
        // run Read step
    }
    else if (result[1] == 1)
    {
        // run Write step
    }
    else
    {
        // run Delete step
    }
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DynamicWorkload/MultinomialDistributionExample.cs).*