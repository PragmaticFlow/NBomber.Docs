---
id: local-dev-cluster
title: Local Dev Cluster
sidebar_position: 4
---

If you don't have an enterprise license key, but you want to try NBomber Cluster you can run it in the development mode. Local Dev Cluster provides a fully flagged cluster mode with a limitation that it allows to run only two nodes per cluster (Coordinator + 1 Agent). This mode is also convenient for developers to test scenarios in cluster without dealing with license keys.

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

Another option to run Local Dev Cluster is via using [CLI arguments](../getting-started/cli): `--cluster-local-dev=true`

```
MyLoadTest.dll --config="autocluster-config.json" --cluster-local-dev=true
```