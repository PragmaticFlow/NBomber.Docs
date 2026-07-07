---
id: cli
title: CLI Arguments
sidebar_position: 5
---

The list of available command line (CLI) arguments of NBomber:

| Command      | Type | Default | Description | Example |
| -----------  | ----------- | ----------- | ----------- | ----------- |
| --config     | `string[]` | — | File or URL path to configuration file (multiple values merged)  | --config=autocluster-config.json |
| --infra      | `string[]` | — | File or URL path to infrastructure config (multiple values merged)  | --infra=infra-config.json |
| --license    | `string` | — | NBomber license key, or a path to a file containing the key  | --license=YOUR_LICENSE_KEY |
| --session-id | `string` | auto-generated | Sets custom SessionId  | --session-id=my-session-123 |
| --test-name  | `string` | `nbomber_default_test_name` | Sets the test name | --test-name=my_test |
| --test-suite | `string` | `nbomber_default_test_suite_name` | Sets the test suite | --test-suite=my_suite |
| --display-console-metrics | `bool` | `true` | Enables console metrics output | --display-console-metrics=true |
| --target | `string[]` | all scenarios | Sets target scenarios (in case of Cluster mode, it sets for both Coordinator and Agent) | --target=my_test |
| --cluster-local-dev     | `bool` | `false` | Enables local dev cluster  | --cluster-local-dev=true |
| --cluster-agents-count  | `int` | `0` | Sets the number of agents in the cluster | --cluster-agents-count=2 |
| --cluster-agent-group   | `string` | — | Sets AgentGroup <br /> *(should be used only with a ManualCluster config)* | --cluster-agent-group=my_group |
| --cluster-id            | `string` | — | Sets ClusterId <br /> *(required to run a cluster via CLI args)*       | --cluster-id=default |
| --cluster-node-type     | `string` | — | Sets NodeType <br /> *(should be used only with a ManualCluster config)*  | --cluster-node-type=coordinator <br /> --cluster-node-type=agent |
| --cluster-nats-url | `string` | — | Sets cluster NATSServerURL <br /> *(required to run a cluster via CLI args)* | --cluster-nats-url=nats://localhost |
| --cluster-coordinator-target | `string[]` | falls back to `--target` | Sets target scenarios for Coordinator | --cluster-coordinator-target=my_test |
| --cluster-agent-target | `string[]` | falls back to `--target` | Sets target scenarios for Agent | --cluster-agent-target=my_test |

:::info Empty target token
For `--target`, `--cluster-coordinator-target`, and `--cluster-agent-target`, the special value `[]` means "run zero scenarios for this role". For example, `--cluster-coordinator-target=[]` keeps the Coordinator idle so it acts purely as an orchestrator while the Agents run the load.
:::

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