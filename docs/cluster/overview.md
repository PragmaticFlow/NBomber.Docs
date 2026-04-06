---
id: overview
title: Overview
sidebar_position: 0
---

import ClusterImage from './img/cluster.jpg'; 

<center><img src={ClusterImage} width="60%" height="60%" /></center>

NBomber Cluster allows you to run load tests distributed across multiple nodes with flexible orchestration.

:::tip
You can run NBomber Cluster without a license key. For details, see [Local Dev Cluster](local-dev-cluster).
:::

:::info
NBomber Cluster depends on the [NATS](https://nats.io/) message broker. Please refer to this [installation guide](../getting-started/installation#install-nats-message-broker).
:::

## Why do you need the cluster?

- **A single NBomber node can no longer generate the required load,** and you need to distribute scenarios across multiple nodes.

- **You need flexible scenario placement across available nodes.** You can specify placement for each scenario in the cluster. For example, run `CreateUserScenario` on one group of nodes, `ReadUserScenario` on a second group, and `SaveUserScenario` on a third.

- **You need to run tests from different geographical regions** to measure latency from multiple locations.

### What does NBomber Cluster provide?

- Runs multiple scenarios on multiple nodes with flexible topology (**scenario placement strategy**).
- **Continuously collects metrics from all Agents and calculates overall statistics at runtime. Additionally, runs threshold checks on the Coordinator node**.
- Collects hardware metrics (CPU, RAM, IO, etc.) from all Agents. These metrics can be used in threshold checks.
- Provides [auto partition assignment](data-partition) for the same scenario across the cluster. This is useful when you need to split data responsibility between Agent instances. Each Agent running the same scenario automatically receives a partition number (key range) that can be used to load, prepare, and work with its assigned data.
- Produces all report types (TXT, CSV, MD, HTML) with **summary across all nodes in the cluster**.
- Produces real-time reporting for the whole cluster.

<!-- startup Order for agents and coordinator -->