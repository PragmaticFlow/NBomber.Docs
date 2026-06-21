---
id: data-partition
title: Data Partition
sidebar_position: 5
---

import AutoPartitionImage from './img/auto-partition.jpeg'; 

In more advanced cluster scenarios, you may need to split your data across Agents so that each one works on a different slice (key range) — and no two Agents touch the same records. NBomber handles this automatically with **Scenario Auto Partitioning**. During scenario initialization, each Agent receives a unique partition number (1, 2, 3, …), which you use to calculate the data range it should handle. For example, with 3 Agents you might assign user IDs `0–100` to partition 1, `100–200` to partition 2, and `200–300` to partition 3.

<center><img src={AutoPartitionImage} width="60%" height="60%" /></center>

## Scenario Auto Partitioning

When you run a Scenario in the cluster, NBomber will:
1. Find all Agents running that Scenario.
2. Assign a unique partition number to each of them automatically.

You can read the **ScenarioPartition** during the [Scenario Init](../nbomber/scenario#scenario-init) phase and use it to derive which key ranges to load.

```csharp
Scenario
    .Create("my-scenario", async context => { ... })
    .WithInit(context =>
    {
        // Number: this Agent's partition (e.g. 1, 2, 3, …)
        var partitionNumber = context.ScenarioPartition.Number;

        // Count: total number of partitions across the cluster.
        var partitionCount = context.ScenarioPartition.Count;
    })
```