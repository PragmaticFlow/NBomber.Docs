---
id: local-dev-cluster
title: Local Dev Cluster
sidebar_position: 4
---

If you don't have an enterprise license key, but you want to try NBomber Cluster you can run it in development mode. Local Dev Cluster gives you a fully-fledged cluster — with a few limits (see below) — and is handy for developing and testing scenarios in a cluster without dealing with license keys.

:::info
Local Dev Cluster has two limitations compared to the licensed cluster mode:

- The cluster size is limited to **3 nodes: 1 Coordinator + 2 Agents**.
- Each test run **auto-stops after 1 minute**.

This is enough for development or a POC. An Enterprise license removes both limitations, letting you run an unlimited number of Agents with no time limit.
:::

Example: 

```csharp
var scenario = Scenario.Create("test_scenario", async context => { ... });

NBomberRunner
    .RegisterScenarios(scenario)
    .LoadConfig("autocluster-config.json")
    // highlight-start
    .EnableLocalDevCluster(true)
    // highlight-end
    .Run();
```

### Run Local Dev Cluster via CLI

Another option to run Local Dev Cluster is via using [CLI arguments](../nbomber/cli): `--cluster-local-dev=true`

```
MyLoadTest.dll --config="autocluster-config.json" --cluster-local-dev=true
```