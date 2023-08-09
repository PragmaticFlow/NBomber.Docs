---
id: auto-cluster
title: Auto Cluster
sidebar_position: 2
---

import AutoClusterImage from './img/autocluster.jpg'; 

<center><img src={AutoClusterImage} width="90%" height="90%" /></center>

`AutoCluster` - it's a cluster configuration type that provides an easy way to establish a cluster without manual configuration for Coordinator and Agents. **The only thing that should be configured is the number of nodes participating in the cluster load tests.** Coordinator will be chosen automatically by leader election. It's recommended to start with `AutoCluster` since it is simpler to set up and fits the majority of load tests.

### AutoCluster Config

This is a basic example of AutoCluster configuration: 

```json title="autocluster-config.json"
{
    "TestSuite": "my test suite",
    "TestName": "my test",

    "ClusterSettings": {

        "AutoCluster": {
            "ClusterId": "my_cluster",
            "NATSServerURL": "nats://localhost",
            "TargetScenarios": ["simple_scenario"],
            "NodeCount": 3
        }

    }    
}
```

The main settings are:

- `ClusterId` is the Id of the NBomber Cluster that will be shared between the NBomber nodes(processes). By this id, NBomber node will be able to discover all participants in the cluster.
- `NATSServerURL` is the URL to the NATS host server. In our example, we will use a `localhost` since we host the NATS message broker on the local machine using docker-compose. You can find more info about NATS connection string by [this link](https://docs.nats.io/using-nats/developer/connecting).
- `TargetScenarios` specifies target scenarios that will we executed in the cluster.
- `NodeCount` specifies the number of NBomber nodes(processes) that will establish a cluster. The minimum value is 2. That's because the one node is always reserved for the Coordinator role. The rest of the nodes will use Agent roles.

This is example of AutoCluster configuration with a ScenariosSettings:

```json title="autocluster-config.json"
{
    "TestSuite": "my test suite",
    "TestName": "my test",

    "ClusterSettings": {

        "AutoCluster": {
            "ClusterId": "my_cluster",
            "NATSServerURL": "nats://localhost",
            "TargetScenarios": ["simple_scenario"],
            "NodeCount": 3
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
