---
id: data-partition
title: Data Partition
sidebar_position: 4
---

Usually, working in the cluster mode requires handling data by partitions (key ranges). NBomber provides built-in functionality for this called **Scenario Auto Partitioning**.

import AutoPartitionImage from './img/auto-partition.jpeg'; 

<center><img src={AutoPartitionImage} width="60%" height="60%" /></center>

## Scenario Auto Partitioning

When you run a Scenario in the cluster, NBomber will:
1. Get all agents that run particular scenarios.
2. Automatically assign a scenario partition number to each Agent.

You can read **ScenarioPartition** on the [Scenario Init](../nbomber/scenario#scenario-init) phase, and then, based on the number you get, you can derive what key ranges should be loaded.

```csharp
Scenario
    .Create("my-scenario", async context => { ... }
    .WithInit(context =>
    {
        // based on the number you get, you can derive what key ranges should be loaded.
        var partitionNumber = context.ScenarioPartition.Number;

        // Count: returns overall scenario partition count across the cluster.
        var partitionCount = context.ScenarioPartition.Count;
    })
```