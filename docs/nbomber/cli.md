---
id: cli
title: CLI Arguments
sidebar_position: 13
---

The list of available command line (CLI) arguments of NBomber:

| Command      | Description | Example |
| -----------  | ----------- | ----------- |
| --config     | File or URL path to configuration file  | --config=autocluster-config.json |
| --infra      | File or URL path to infrastructure config  | --infra=infra-config.json |
| --license    | NBomber license key  | --license=YOUR_LICENSE_KEY |
| --session-id | Sets custom SessionId  | --session-id=my-session-123 |
| --display-console-metrics | Enables console metrics output | --display-console-metrics=true |
| --target | Sets target scenarios (in case of Cluster mode, it sets for both Coordinator and Agent) | --target=my_test |
| --cluster-local-dev     | Enables local dev cluster  | --cluster-local-dev=true |
| --cluster-agents-count  | Sets the number of agents in the cluster | --cluster-agents-count=2 |
| --cluster-agent-group   | Sets AgentGroup <br /> *(should be used only for ManualCluster)* | --cluster-agent-group=my_group |
| --cluster-id            | Sets ClusterId       | --cluster-id=test_cluster |
| --cluster-node-type     | Sets NodeType <br /> *(should be used only for ManualCluster)*  | --cluster-node-type=coordinator <br /> --cluster-node-type=agent |
| --cluster-nats-url | Sets cluster NATSServerURL | --cluster-nats-url=nats://localhost |
| --cluster-coordinator-target | Sets target scenarios for Coordinator | --cluster-coordinator-target=my_test |
| --cluster-agent-target | Sets target scenarios for Agent | --cluster-agent-target=my_test |

:::info
It’s important to note that, if you want your application to handle CLI arguments, you should pass them into the `NBomberRunner.Run(string[] args)` method.

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

Example of usage:

```bash
dotnet MyLoadTest.dll --license=YOUR_LICENSE_KEY --config=config.json
```