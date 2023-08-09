---
id: run-cluster
title: How to Run Cluster
sidebar_position: 1
---

import AutoClusterImage from './img/autocluster.jpg'; 

<center><img src={AutoClusterImage} width="90%" height="90%" /></center>

:::info
We assume that you are already familiar with:
 - The basics of NBomber API (Scenario, Step, NBomberRunner). 
 - You can configure your load tests via [JSON configuration](../nbomber/json-config). 
 - You [installed](../getting-started/installation#install-nats-message-broker) NATS message broker.
:::

To run NBomber in the cluster mode you need to choose the configuration type.

### Cluster types configurations

- [AutoCluster](auto-cluster) - this type provides an easy way to establish a cluster without manual configuration for Coordinator and Agents. **The only thing that should be configured is the number of nodes participating in the cluster.** Coordinator will be chosen automatically by leader election. It's recommended to start with `AutoCluster` since it is simpler to set up and fits the majority of load tests.

- `ManualCluster` - this type provides an advanced way to configure a cluster manually for Coordinator and Agents. The main benefit of this type of configuration is that it allows you to choose the scenario placement topology. You will be able to specify the TargetScenarios for Agents and Coordiantor separately. For example, you want to test some web service by running the `Create User` scenario on one Agent node but the `Read User` scenario on the second Agent. With `ManualCluster` configuration, you can configure a cluster with a concrete scenario placement per node (AgentGroup) in the cluster. This configuration type is recommended when you have a concrete need for granular scenario placement inside a cluster.

For simplicity, we will be using AutoCluster configuration.

```json title="autocluster-config.json"
{
    "TestSuite": "my test suite",
    "TestName": "my test",

    "ClusterSettings": {

        "AutoCluster": {
            "ClusterId": "my_cluster",
            "NATSServerURL": "nats://localhost",
            "TargetScenarios": ["simple_scenario"],
            "NodeCount": 2
        }

    }    
}
```

The main settings are:

- `ClusterId` is the Id of the NBomber Cluster that will be shared between the NBomber nodes(processes). By this id, NBomber node will be able to discover all participants in the cluster.
- `NATSServerURL` is the URL to the NATS host server. In our example, we will use a `localhost` since we host the NATS message broker on the local machine using docker-compose. You can find more info about NATS connection string by [this link](https://docs.nats.io/using-nats/developer/connecting).
- `TargetScenarios` specifies target scenarios that will we executed in the cluster.
- `NodeCount` specifies the number of NBomber nodes(processes) that will establish a cluster. The minimum value is 2. That's because the one node is always reserved for the Coordinator role. The rest of the nodes will use Agent roles.

Let's assume we already have a Scenario named `"simple_scenario"` that we want to run in the cluster. The only thing that we need is to load the cluster configuration (in our case it's AutoCluster) and run it. 

### Run Cluster

```csharp
var scenario = Scenario.Create("simple_scenario", async context => { ... });

NBomberRunner
    .RegisterScenarios(scenario)
    // highlight-start
    .LoadConfig("autocluster-config.json")
    .License("YOUR_ENTERPRISE_LICENSE_KEY")
    // highlight-end
    .Run();
```

### Run Local Dev Cluster

:::info
If you don't have an enterprise license key but you want to try NBomber Cluster you can run it in the development mode via `NBomberRunner.EnableLocalDevCluster`.
:::

LocalDevCluster provides you a full flagged cluster mode with with a limitation that you can run only two nodes per cluster(1 Coordinator + 1 Agent).

```csharp
var scenario = Scenario.Create("simple_scenario", async context => { ... });

NBomberRunner
    .RegisterScenarios(scenario)
    .LoadConfig("autocluster-config.json")
    // highlight-start
    .EnableLocalDevCluster(true)
    // highlight-end
    .Run();
```

### Run Cluster via CLI

Another option to run cluster is via using CLI arguments:

```
MyLoadTest.dll --config="autocluster-config.json" --license="YOUR_ENTERPRISE_LICENSE_KEY"
```

For local dev cluster you can use:
```
MyLoadTest.dll --config="autocluster-config.json" --cluster-local-dev=true
```
<!-- startup Order for agents and coordinator -->