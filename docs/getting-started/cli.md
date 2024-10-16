---
id: cli
title: CLI Arguments
sidebar_position: 3
---

The list of available command line (CLI) arguments of NBomber:

| command      | description | example |
| -----------  | ----------- | ----------- |
| --config     | file or URL path for configuration config  | --config=autocluster-config.json |
| --infra      | file or URL path for infrastracture config  | --infra=infra-config.json |
| --license    | NBomber license key  | --license=YOUR_LICENSE_KEY |
| --session-id | Sets custom SessionId  | --session-id=my-session-123 |
| --display-console-metrics | Enables the printing of metrics to the console | --display-console-metrics=true |
| --cluster-local-dev     | Enables local dev cluster  | --cluster-local-dev=true |
| --cluster-agents-count  | Overrides AgentsCount     | --cluster-agents-count=2 |
| --cluster-agent-group   | Specifies AgentGroup <br /> *(should be used only for ManualCluster)* | --cluster-agent-group=my_group |
| --cluster-id            | Overrides ClusterId       | --cluster-id=test_cluster |
| --cluster-node-type     | Specifies NodeType <br /> *(should be used only for ManualCluster)*  | --cluster-node-type=coordinator <br /> --cluster-node-type=agent |
