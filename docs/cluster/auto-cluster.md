---
id: auto-cluster
title: Auto Cluster
sidebar_position: 2
---

import AutoClusterImage from './img/autocluster.jpg'; 

<center><img src={AutoClusterImage} width="90%" height="90%" /></center>

`AutoCluster` - it's a cluster configuration type that provides an easy way to establish a cluster. **With this type of configuration Coordinator will be chosen automatically by leader election.** 

:::info
If you are a beginner, starting with AutoCluster is recommended since it is simpler to set up and fits the majority of load tests.
:::

## AutoCluster Config

This is a basic example of AutoCluster configuration for a cluster with two nodes (Coordinator + 1 Agent): 

```json title="autocluster-config.json"
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

This is example of AutoCluster configuration with a ScenariosSettings:

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

    },
    
    "GlobalSettings": {

        "ScenariosSettings": [
            {
                "ScenarioName": "test_scenario",
                "LoadSimulationsSettings": [{ "Inject": [1, "00:00:01", "00:00:01"] }]
            }
        ],

        "ReportingInterval": "00:00:05"
    }
}
```
