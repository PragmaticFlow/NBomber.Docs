---
id: coordinator
title: Coordinator
sidebar_position: 1
---

import ClusterImage from './img/cluster.jpg'; 

<center><img src={ClusterImage} width="80%" height="80%" /></center>

Coordinator is a component responsible for coordinating the execution of the entire test for NBomber Cluster: scenario warm-up/start/stop/placement, fetching all metrics from Agent(s), etc. 

:::info
Only one Coordinator is allowed per cluster.
:::

## Coordinator JSON Config

On the binary level Coordinator and Agent are the same NBomber applications. The only difference is what JSON Config file will be loaded. To start acting as a Coordiantor, NBomberClusterRunner should load Coordinator JSON Config file. To load JSON Config, you can use: local file path, HTTP URL, CLI argument "--config".

```csharp
NBomberClusterRunner
    .RegisterScenarios(scenario)    
    .LoadConfig("coordinator-config.json")    
    .Run();
```

*To get more information about JSON Config, please read [this page](../using-nbomber/basic-api/json-config).*

Example:

```json
{
    "ClusterSettings": {

        "Coordinator": {
            "ClusterId": "nbomber_cluster",
            "NATSServerURL": "nats://localhost",            
            
            "TargetScenarios": ["publisher"],
            
            "Agents": [
                { "AgentGroup": "1", "TargetScenarios": ["slow_subscribers"] },
                { "AgentGroup": "2", "TargetScenarios": ["fast_subscribers"] }
            ],
            
            "MinAgentsCount": 100
        }

    }
}
```

Available settings:

- `ClusterId` is the Id of the NBomber Cluster that will be shared between the Coordinator and Agents. By this id, Coordinator will be able to discover all relevant Agent(s) in the cluster. Cluster Id can be any string value.
- `NATSServerURL` is the URL to the NATS host server. You can find more infor about NATS connection string by [this link](https://docs.nats.io/using-nats/developer/connecting). 
- `TargetScenarios` specifies target scenarios that Coordinator will execute only. It's an optional parameter. Usually, for high-load scenarios is better to keep this parameter empty to unload Coordinator.
- `Agents` specifies AgentGroup(s) with TargetScenarios.
- `MinAgentsCount` specifies a minimal number of agents to start the test. This parameter is optional. If it's not set, the Coordinator will try to discover available agents and wait until the cluster is stabilized. If this parameter is set, Coordinator will wait until the required number of agents become available.

This is the type definition for CoordinatorSettings:

```fsharp
type AgentGroupSettings = {
    AgentGroup: string
    TargetScenarios: string list
}

type CoordinatorSettings = {
    ClusterId: string
    NATSServerURL: string
    TargetScenarios: string list option
    Agents: AgentGroupSettings list
    MinAgentsCount: int option
}
```

### Coordinator JSON Config with GlobalSettings

In addition to the basics coordinator's settings, the Coordinator JSON Config can contain GlobalSettings.

Example:

```json
{
    "TestSuite": "NATS Load Tests",
    "TestName": "Ping Pong",

    "ClusterSettings": {
        "Coordinator": {
            "ClusterId": "nbomber_test_cluster",
            "NATSServerURL": "nats://my-nats",
            "TargetScenarios": ["http_scenario"],
            "Agents": [
                { "AgentGroup": "1", "TargetScenarios": ["http_scenario"] }
            ]
        }
    },

    "GlobalSettings": {

        "ScenariosSettings": [
            {
                "ScenarioName": "http_scenario",
                "WarmUpDuration": "00:00:01",

                "LoadSimulationsSettings": [
                    { "Inject": [100, "00:00:01", "00:01:00"] }
                ]
            },
            {
                "ScenarioName": "my-test-scenario",

                "LoadSimulationsSettings": [
                    { "Inject": [1, "00:00:01", "00:00:30"] }
                ],

                "CustomSettings": {
                    "TargetHost": "localhost",
                    "MsgSizeInBytes": 1000,
                    "PauseMs": 100
                },

                "MaxFailCount": 500
            }
        ]
    }
}
```