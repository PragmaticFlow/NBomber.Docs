---
id: run-cluster-cli
title: Run Cluster via CLI Args
sidebar_position: 2
---

import ClusterImage from './img/cluster.jpg'; 

<center><img src={ClusterImage} width="60%" height="60%" /></center>

:::info
We assume that you are already familiar with:
 - The basics of NBomber API: [Scenario](../nbomber/scenario), [Step](../nbomber/scenario/step), [NBomberRunner](../nbomber/nbomber-runner). 
 - You have installed [NATS](install-nats) message broker and having it up and running.
:::

:::tip
You can run NBomber Cluster without a license key. For details, see [Local Dev Cluster](local-dev-cluster).
:::

:::info
New to cluster mode? See the [Overview](overview#terminology) for the **Coordinator**, **Agent**, and **Message Broker** roles before continuing.
:::

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

## Cluster CLI args

These are the CLI args you will typically use to run a cluster. For the complete list of all NBomber CLI args, see [CLI Arguments](../nbomber/cli).

| Arg | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `--cluster-id` | `string` | **yes** | — | Namespace used by cluster members to discover each other. |
| `--cluster-nats-url` | `string` | **yes** | — | URL of the NATS message broker. |
| `--cluster-agents-count` | `int` | no | `0` | Number of Agents that must join before the test starts. |
| `--target` | `string[]` | no | all scenarios | Target scenarios to run (applies to both Coordinator and Agents). |
| `--cluster-coordinator-target` | `string[]` | no | falls back to `--target` | Target scenarios to run only on the Coordinator. |
| `--cluster-agent-target` | `string[]` | no | falls back to `--target` | Target scenarios to run only on the Agents. |
| `--cluster-local-dev` | `bool` | no | `false` | Enables [Local Dev Cluster](local-dev-cluster) (no license required). |
| `--license` | `string` | no | — | License key, or a path to a file containing the key. |

## Run Cluster without License Key

:::info
If you don't have a license key but want to try cluster mode, you can use [Local Dev Cluster](local-dev-cluster). It provides a fully-fledged cluster mode with two limitations: the cluster size is capped at three members (1 Coordinator + 2 Agents), and each test run auto-stops after 1 minute. These limits are enough for development or a POC to try cluster mode. The example above would look like this:

```bash
# to start NBomber process 1 (Agent)
dotnet my-nbomber-test.dll --cluster-local-dev=true --cluster-id=default --cluster-agents-count=2 --cluster-nats-url=nats://localhost

# to start NBomber process 2 (Agent)
dotnet my-nbomber-test.dll --cluster-local-dev=true --cluster-id=default --cluster-agents-count=2 --cluster-nats-url=nats://localhost

# to start NBomber process 3 (Coordinator)
dotnet my-nbomber-test.dll --cluster-local-dev=true --cluster-id=default --cluster-agents-count=2 --cluster-nats-url=nats://localhost
```

The main difference is that we use: `--cluster-local-dev=true`.
:::

## Set TargetScenarios

You may have a case where you registered several load test scenarios but want to run only a specific one. For this, you can specify what scenarios you want to run by setting `--target`. If you don't specify `--target`, all registered scenarios in your project will run.

```bash
# to start NBomber process 1 (Agent)
dotnet my-nbomber-test.dll \
    # highlight-start
    --target=my_scenario \
    # highlight-end
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY

# to start NBomber process 2 (Coordinator)
dotnet my-nbomber-test.dll \
    # highlight-start
    --target=my_scenario \
    # highlight-end
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY
```

### Multiple target scenarios
You can specify multiple scenarios via `--target`, it has type `string[]`.

```bash
# to start NBomber process 1 (Agent)
dotnet my-nbomber-test.dll \
    # highlight-start
    --target=my_scenario,my_scenario_2 \
    # highlight-end
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY

# to start NBomber process 2 (Coordinator)
dotnet my-nbomber-test.dll \
    # highlight-start
    --target=my_scenario,my_scenario_2 \
    # highlight-end
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY
```

### Running different target scenarios on Coordinator and Agents
If you want to run different scenarios on Coordinator and Agents, you can use `--cluster-coordinator-target` and `--cluster-agent-target`.

```bash
# to start NBomber process 1 (Agent)
dotnet my-nbomber-test.dll \
    # highlight-start
    --cluster-coordinator-target=my_scenario \    
    --cluster-agent-target=my_scenario_2 \
    # highlight-end
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY

# to start NBomber process 2 (Coordinator)
dotnet my-nbomber-test.dll \
    # highlight-start
    --cluster-coordinator-target=my_scenario \
    --cluster-agent-target=my_scenario_2 \
    # highlight-end
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY
```

### Running scenarios only on Agents

A common setup is to keep the Coordinator idle (acting purely as a test orchestrator) and run the load test scenarios only on the Agents. This prevents the Coordinator's work from distorting the load test results.

To do this, set the Coordinator's target scenarios to an empty list using the special `[]` value. The Coordinator will then run no scenarios, while the Agents run the load.

```bash
# to start NBomber process 1 (Agent)
dotnet my-nbomber-test.dll \
    # highlight-start
    --cluster-coordinator-target=[] \
    --cluster-agent-target=my_scenario \
    # highlight-end
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY

# to start NBomber process 2 (Coordinator)
dotnet my-nbomber-test.dll \
    # highlight-start
    --cluster-coordinator-target=[] \
    --cluster-agent-target=my_scenario \
    # highlight-end
    --cluster-id=default \
    --cluster-agents-count=1 \
    --cluster-nats-url=nats://localhost --license=YOUR_LICENSE_KEY
```

:::info
The `[]` value is a special token that means "run zero scenarios for this role". It works for `--cluster-coordinator-target`, `--cluster-agent-target`, and `--target`. In the example above, `--cluster-coordinator-target=[]` keeps the Coordinator free as an orchestrator, while `--cluster-agent-target=my_scenario` runs the load on the Agents.
:::

## What's next

Prefer to define cluster settings in a JSON file (and unlock advanced scenario placement across node groups)? See [Run Cluster via JSON Config](run-cluster-json).