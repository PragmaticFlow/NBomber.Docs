---
id: manual-cluster
title: Manual Cluster
sidebar_position: 3
---

import ManualClusterImage from './img/manual-cluster.jpg'; 

<center><img src={ManualClusterImage} width="100%" height="100%" /></center>

`ManualCluster` - it's a cluster configuration type that provides additional control on Scenario placement. **With this type of configuration, you can deploy different types of Scenarios on different sets of nodes**. Basically, you can specify the placement for each Scenario in the cluster (via AgentGroups). Also, Coordinator and Agent should be assigned manually on startup via code or CLI arguments. 

For example, you want to test some web service by running the `CreateUser` scenario on limited group of nodes but the `ReadUser` scenario on the second group of nodes. And on the third group of nodes, you would like to run periodically `SaveUser` scenario. This is perfect use case for ManualCluster since it provides you ability to run deploy different type of Scenarios on different set of nodes.

:::info
If you are a beginner, starting with [AutoCluster](auto-cluster) is recommended since it is simpler to set up and fits the majority of load tests.
:::

## ManualCluster Config

This is a basic example of ManualCluster configuration for a cluster with two nodes (Coordinator + 1 Agent). This config looks similar to [AutoCluster config](auto-cluster#autocluster-config), except it contains the settings for AgentGroups. 

```json title="manual-cluster-config.json"
{
    "TestSuite": "my test suite",
    "TestName": "my test",

    "ClusterSettings": {

        "ManualCluster": {
            "ClusterId": "test_cluster",
            "NATSServerURL": "nats://localhost",

            "Coordinator": {
                "TargetScenarios": ["test_scenario"]
            },

            "Agent": {
                // highlight-start
                "AgentGroups": [{ "AgentGroup": "1", "TargetScenarios": ["test_scenario"] }],
                // highlight-end
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
- `AgentGroups` specifies the list of AgentGroup that contains target scenarios per assigned group.
- `AgentsCount` specifies the number of Agents that should join the cluster (by ClusterId) to allow Coordinator to start a load test.

### Agent and AgentGroup

`Agent` is a cluster role which is responsible for running load test scenarios and reacting to the commands from the coordinator. `AgentGroup` represents a virtual group for Agent node type. This group contains TargetScenarios that will be executed on the agents under this group. 

```json
"Agent": {    
    "AgentGroups": [
        { "AgentGroup": "1", "TargetScenarios": ["scneario_1"] },
        { "AgentGroup": "2", "TargetScenarios": ["scenario_2"] },
        { "AgentGroup": "my_group", "TargetScenarios": ["scenario_3"] }
    ],    
    "AgentsCount": 1
}
```

To start NBomber process as Agent you should use this command:

```
MyLoadTest.dll --config="manual-cluster-config.json" --cluster-node-type=agent --cluster-agent-group=my_group
```

By executing this command NBomber process will start as Agent under: `"AgentGroup": "1", "TargetScenarios": ["scneario_1"]`

*Here, you can find a list of all available [CLI arguments](../getting-started/cli).*

Also, you can start Agent via code:

```csharp
var scenario1 = Scenario.Create("scneario_1", async context => { ... });
var scenario2 = Scenario.Create("scenario_2", async context => { ... });
var scenario3 = Scenario.Create("scenario_3", async context => { ... });

NBomberRunner
    .RegisterScenarios(scenario1, scenario2, scenario3)
    .LoadConfig("manual-cluster-config.json")
    .WithAgentGroup("my_group")
    .WithNodeType(NodeType.Agent)
    .Run(args);
```

### Coordinator

Coordinator is a cluster role responsible for coordinating the execution of the entire test for NBomber Cluster: scenario warm-up/start/stop/placement, fetching all metrics from Agent(s), etc. 

:::info
Only one instance of Coordinator is allowed per cluster.
:::

To start NBomber process as Coordinator you should use this command:

```
MyLoadTest.dll --config="manual-cluster-config.json" --cluster-node-type=coordinator 
```

*Here, you can find a list of all available [CLI arguments](../getting-started/cli).*

Also, you can start Coordinator via code:

```csharp
var scenario1 = Scenario.Create("scneario_1", async context => { ... });
var scenario2 = Scenario.Create("scenario_2", async context => { ... });
var scenario3 = Scenario.Create("scenario_3", async context => { ... });

NBomberRunner
    .RegisterScenarios(scenario1, scenario2, scenario3)
    .LoadConfig("manual-cluster-config.json")
    .WithNodeType(NodeType.Coordinator)
    .WithAgentsCount(50)
    .Run(args);
```