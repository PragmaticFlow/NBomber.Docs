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
NBomber Cluster depends on the [NATS](https://nats.io/) message broker. Please refer to this [installation guide](install-nats).
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