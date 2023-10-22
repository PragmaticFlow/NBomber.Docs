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
 - You [installed](../getting-started/installation#install-nats-message-broker) NATS message broker.
:::

To run NBomber in the cluster mode, you need:
- Choose [cluster configuration type](#cluster-configuration-types) with related settings.
- Run as many NBomber instances(copies of NBomber process) with the specified configuration type as you want for the cluster.

```csharp
// Run as many NBomber instances as you want
NBomberRunner
    .RegisterScenarios(scenario)    
    .LoadConfig("autocluster-config.json") // file configuration path
```

### Cluster configuration types

- [AutoCluster](auto-cluster) - it's a cluster configuration type that provides an easy way to establish a cluster. **With this type of configuration Coordinator will be chosen automatically by leader election.** It's recommended to start with `AutoCluster` since it is simpler to set up and fits the majority of load tests.

- [ManualCluster](manual-cluster) - this type provides an advanced way to configure a cluster manually for Coordinator and Agents. The main benefit of this type of configuration is that it allows you to choose the scenario placement topology. You will be able to specify the TargetScenarios for Agents and Coordiantor separately. For example, you want to test some web service by running the `Create User` scenario on one Agent node but the `Read User` scenario on the second Agent. With `ManualCluster` configuration, you can configure a cluster with a concrete scenario placement per node (AgentGroup) in the cluster. This configuration type is recommended when you have a concrete need for granular scenario placement inside a cluster.

For simplicity, we will be using AutoCluster configuration for a cluster with two nodes (Coordinator + 1 Agent).

```json title="auto-cluster-config.json"
{
    "TestSuite": "my test suite",
    "TestName": "my test",

    "ClusterSettings": {

        "AutoCluster": {
            "ClusterId": "test_cluster",
            "NATSServerURL": "nats://localhost",

            "Coordinator": {
                "TargetScenarios": ["test_scenario"]
            },

            "Agent": {
                "TargetScenarios": ["test_scenario"],
                "AgentsCount": 1
            }
        }

    }    
}
```

The main settings are:

- `ClusterId` is the Id of the NBomber Cluster that will be shared between the NBomber nodes(processes). By this id, NBomber node will be able to discover all participants in the cluster.
- `NATSServerURL` is the URL to the NATS host server. In our example, we will use a `localhost` since we host the NATS message broker on the local machine using docker-compose. You can find more info about NATS connection string by [this link](https://docs.nats.io/using-nats/developer/connecting).
- `TargetScenarios` specifies target scenarios that will be executed in the cluster. You can specify different TargetScenarios for Coordinator and Agents.
- `AgentsCount` specifies the number of Agents that should join the cluster (by ClusterId) to allow Coordinator to start a load test.

Let's assume we already have a Scenario named `"test_scenario"` that we want to run in the cluster. The only thing that we need is to load the cluster configuration (in our case it's AutoCluster) and run it. 

### Run Cluster

```csharp
var scenario = Scenario.Create("test_scenario", async context => { ... });

NBomberRunner
    .RegisterScenarios(scenario)
    // highlight-start
    .LoadConfig("auto-cluster-config.json")
    .License("YOUR_ENTERPRISE_LICENSE_KEY")
    // highlight-end
    .Run();
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Cluster/AutoCluster).*

### Run Local Dev Cluster

:::info
If you don't have an enterprise license key but you want to try NBomber Cluster you can run it in the development mode via [LocalDevCluster](local-dev-cluster).
:::