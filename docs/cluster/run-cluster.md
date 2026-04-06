---
id: run-cluster
title: How to Run Cluster
sidebar_position: 1
---

import ClusterImage from './img/cluster.jpg'; 

<center><img src={ClusterImage} width="60%" height="60%" /></center>

:::info
We assume that you are already familiar with:
 - The basics of NBomber API: [Scenario](../nbomber/scenario), [Step](../nbomber/scenario/step), [NBomberRunner](../nbomber/nbomber-runner). 
 - You have installed [NATS](../getting-started/installation#install-nats-message-broker) message broker and having it up and running.
:::

:::tip
You can run NBomber Cluster without a license key. For details, see [Local Dev Cluster](local-dev-cluster).
:::

## Terminology

:::info
Cluster mode introduces two distinct roles: **Coordinator** (aka Leader) and **Agent** (aka Worker). To form a cluster, you need 1 Coordinator + N Agent(s).
Each NBomber instance (process) runs as either a **Coordinator** or an **Agent**. **There can be only one Coordinator per cluster, and the cluster cannot start without it.** You can run an unlimited number of independent clusters in parallel, each containing 1 Coordinator + N Agent(s). Cluster members discover each other by `ClusterId` (think of it as a namespace).
:::

- **Coordinator** — orchestrates the entire test. There can be only one Coordinator per cluster, and the cluster cannot start without it. The Coordinator can also execute load test scenarios, just like an Agent. You can control which scenarios run on the Agents and which run on the Coordinator. This is useful when you want to run a specific scenario as a singleton within the cluster. Alternatively, you can configure scenarios to run only on Agents, keeping the Coordinator free to act solely as a test orchestrator — fetching metrics from Agents and evaluating thresholds.
:::tip
It can be beneficial to run load test scenarios only on Agents and keep the Coordinator free to act solely as a test orchestrator. The main idea is to keep the Coordinator idle so it doesn't distort load test results. In practice, the Coordinator typically runs only lightweight scenarios that need to execute as a singleton (for example, periodically writing a message to Kafka).
:::
- **Agent** — executes load test scenarios and responds to commands from the Coordinator.
- **Message Broker** — the communication hub of the cluster. All communication between the Coordinator and Agents flows through the message broker: the Coordinator sends commands to Agents, and Agents send metrics back to the Coordinator for aggregation.

## Run Cluster via CLI Args
The simplest way to set up and run an NBomber load test in cluster mode is by using [CLI Args](../nbomber/cli).

:::info
Make sure that NBomberRunner in your load test project accepts CLI Args.

```csharp
static void Main(string[] args)
{
    var scenario = Scenario.Create("scenario", ...);

    NBomberRunner
        .RegisterScenario(scenario)
        // highlight-start
        .Run(args);
        // highlight-end
}
```
:::

Imagine we have an NBomber load test project that we want to run in cluster mode on 3 nodes. For this, we should start a NATS message broker and run 3 instances of our NBomber load test app, which will discover each other via NATS and start the load test together.

:::tip
For demo purposes, you can spin up 3 NBomber processes on the same node. In production, however, each NBomber process should run on a dedicated node (or Pod in K8s). 

Note that you don't explicitly assign a role (Agent or Coordinator) to each NBomber process. Instead, NBomber Cluster uses leader election to automatically determine which process becomes the Coordinator and which ones act as Agents.
:::

```bash
# to start NBomber process 1 (Agent)
dotnet my-nbomber-test.dll --cluster-id=default --cluster-agents-count=2 --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY

# to start NBomber process 2 (Agent)
dotnet my-nbomber-test.dll --cluster-id=default --cluster-agents-count=2 --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY

# to start NBomber process 3 (Coordinator)
dotnet my-nbomber-test.dll --cluster-id=default --cluster-agents-count=2 --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY
```

Here we spin up three NBomber processes and pass the required cluster arguments:
- **--cluster-id** - think of this as a namespace for cluster members. Cluster members use this `cluster-id` to discover each other. The main reason for the existence of `--cluster-id` is to allow you to run multiple cluster runs in parallel and to prevent any members collision.
- **--cluster-agents-count** - the number of Agents that will join the cluster with the specified `cluster-id`. In this case, the cluster will consist of 2 Agents. We don't specify the number of Coordinators since there is always exactly 1. So the total cluster size is 3 members: 1 Coordinator + 2 Agents.
- **--cluster-nats-url** - the URL of the NATS message broker. In our example, we use `localhost` since we host NATS on the local machine using `docker-compose`. You can find more info about NATS connection strings [here](https://docs.nats.io/using-nats/developer/connecting).

### Run Cluster without License Key

:::info
If you don't have a license key but want to try cluster mode, you can use [Local Dev Cluster](local-dev-cluster). It provides a fully-fledged cluster mode with a limitation in cluster size of two members: 1 Coordinator + 1 Agent — that's the only limitation, but it's enough for development or a POC to try cluster mode. The example above would look like this:

```bash
# to start NBomber process 1 (Agent)
dotnet my-nbomber-test.dll --cluster-local-dev=true --cluster-id=default --cluster-agents-count=1 --cluster-nats-url=nats://localhost

# to start NBomber process 2 (Coordinator)
dotnet my-nbomber-test.dll --cluster-local-dev=true --cluster-id=default --cluster-agents-count=1 --cluster-nats-url=nats://localhost
```

The main difference is that we use: `--cluster-agents-count=1` and `--cluster-local-dev=true`.
:::

### Set TargetScenarios

You may have a case where you registered several load test scenarios but want to run only a specific one. For this, you can specify what scenarios you want to run by setting `--target`. 

```bash
# to start NBomber process 1 (Agent)
dotnet my-nbomber-test.dll --target=my_scenario --cluster-id=default --cluster-agents-count=1 --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY

# to start NBomber process 2 (Coordinator)
dotnet my-nbomber-test.dll --target=my_scenario --cluster-id=default --cluster-agents-count=1 --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY
```

#### Multiple target scenarios
You can specify multiple scenarios via `--target`, it has type `string[]`.

```bash
# to start NBomber process 1 (Agent)
dotnet my-nbomber-test.dll \
    --target=my_scenario,my_scenario_2 \
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY

# to start NBomber process 2 (Coordinator)
dotnet my-nbomber-test.dll \
    --target=my_scenario,my_scenario_2 \
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY
```

#### Running different target scenarios on Coordinator and Agents
If you want to run different scenarios on Coordinator and Agents, you can use `--cluster-coordinator-target` and `--cluster-agent-target`.

```bash
# to start NBomber process 1 (Agent)
dotnet my-nbomber-test.dll \
    --cluster-coordinator-target=my_scenario \
    --cluster-agent-target=my_scenario_2 \
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY

# to start NBomber process 2 (Coordinator)
dotnet my-nbomber-test.dll \
    --cluster-coordinator-target=my_scenario \
    --cluster-agent-target=my_scenario_2 \
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY
```

#### Running scenarios only on Agents
TBD

## Run Cluster via JSON Config

Forming and running a cluster via JSON Config provides an additional level of flexibility. With this option you can control scenario placement in the cluster. Additionally, for some users it's more natural and convenient to define settings in a JSON config. You can also combine JSON Config and CLI Args to override some of the settings.

<!-- To run NBomber in the cluster mode, you need:
- Choose a [cluster configuration type](#cluster-configuration-types) with related settings.
- Run as many NBomber instances (copies of the NBomber process) with the specified configuration type as you need for the cluster. -->

### Cluster configuration types

- [AutoCluster](auto-cluster) - a configuration type that provides an easy way to set up a cluster. **With this configuration, the Coordinator is chosen automatically via leader election.** It's recommended to start with `AutoCluster` since it's simpler to set up and fits the majority of load tests.

- [ManualCluster](manual-cluster) - an advanced configuration type for manually setting up the Coordinator and Agents. The main benefit is the ability to control scenario placement topology. You can specify different TargetScenarios for Agents and the Coordinator separately. For example, you might want to run the `Create User` scenario on one Agent node and the `Read User` scenario on another. With `ManualCluster`, you can define specific scenario placement per node (AgentGroup) in the cluster. This configuration type is recommended when you need granular control over scenario placement.

For simplicity, we will be using AutoCluster configuration for a cluster with two nodes (Coordinator + 1 Agent).

```json title="auto-cluster-config.json"
{
    "TestSuite": "my test suite",
    "TestName": "my test",

    "ClusterSettings": {

        // highlight-start
        "AutoCluster": {
        // highlight-end            
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

- **ClusterId** - think of this as a namespace for cluster members. Cluster members use this `ClusterId` to discover each other. The main reason for the existence of `ClusterId` is to allow you to run multiple cluster runs in parallel and to prevent any members collision.
- **NATSServerURL** - the URL of the NATS message broker. In our example, we use `localhost` since we host NATS on the local machine using `docker-compose`. You can find more info about NATS connection strings [here](https://docs.nats.io/using-nats/developer/connecting).
- **TargetScenarios** - specifies target scenarios that will be executed in the cluster. You can specify different TargetScenarios for Coordinator and Agents.
- **AgentsCount** - the number of Agents that will join the cluster with the specified `ClusterId`. In this case, the cluster will consist of 1 Agent. We don't specify the number of Coordinators since there is always exactly 1. So the total cluster size is 2 members: 1 Coordinator + 1 Agent.

Let's assume we already have a Scenario named `"test_scenario"` that we want to run in the cluster. All we need to do is load the cluster configuration (in our case, AutoCluster) and run it.

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

### Run via CLI args

```
MyLoadTest.dll --config="auto-cluster-config.json"
```

You can also pass other CLI args:

```
MyLoadTest.dll --config="auto-cluster-config.json" --cluster-agents-count=5 --license=YOUR_LICENSE_KEY
```

*Here, you can find a list of all available [CLI arguments](../nbomber/cli).*

### Run Local Dev Cluster

:::info
If you don't have an enterprise license key but want to try NBomber Cluster, you can run it in development mode via [LocalDevCluster](local-dev-cluster).
:::