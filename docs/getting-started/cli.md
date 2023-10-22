---
id: cli
title: CLI Arguments
sidebar_position: 2
---

The list of available command line (CLI) arguments of NBomber:

| command      | description | example |
| -----------  | ----------- | ----------- |
| --config     | file or URL path for configuration config  | --config=autocluster-config.json |
| --infra      | file or URL path for infrastracture config  | --infra=infra-config.json |
| --license    | NBomber license key  | --license=YOUR_LICENSE_KEY |
| --cluster-local-dev     | enable local dev cluster  | --cluster-local-dev=true |
| --cluster-agents-count  | overrides AgentsCount     | --cluster-agents-count=2 |
| --cluster-agent-group   | specifies AgentGroup <br /> *(should be used only for ManualCluster)* | --cluster-agent-group=my_group |
| --cluster-id            | overrides ClusterId       | --cluster-id=test_cluster |
| --cluster-node-type     | specifies NodeType <br /> *(should be used only for ManualCluster)*  | --cluster-node-type=coordinator <br /> --cluster-node-type=agent |
