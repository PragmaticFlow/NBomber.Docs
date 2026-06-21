---
id: overview
title: Overview
sidebar_position: 0
---

import ClusterImage from './img/cluster.jpg'; 

<center><img src={ClusterImage} width="60%" height="60%" /></center>

NBomber Cluster allows you to run load tests distributed across multiple nodes, with control over where each scenario runs.

:::tip
You can try and run NBomber Cluster without a license key. For details, see [Local Dev Cluster](local-dev-cluster).
:::

## When do you need a cluster?

- **A single NBomber node can no longer generate the required load,** and you need to distribute scenarios across multiple nodes.

- **You need flexible scenario placement across available nodes.** You can specify placement for each scenario in the cluster. For example, run `CreateUserScenario` on one group of nodes, `ReadUserScenario` on a second group, and `SaveUserScenario` on a third.

- **You need to run tests from different geographical regions** to measure latency from multiple locations.

:::info
NBomber Cluster uses the [NATS](https://nats.io/) message broker for communication between nodes. Please refer to this [installation guide](install-nats) to install NATS since NBomber Cluster depends on it.
:::

:::tip[Run a cluster the easy way with NBomber Studio]
Setting up a cluster manually means installing a [NATS](install-nats) broker and starting multiple NBomber processes yourself. [NBomber Studio](../nbomber-studio/loadtests-in-k8s/overview) automates all of this in Kubernetes — it provisions NATS, deploys your test across as many Agent Pods as you configure, and tears down every resource it created once the test finishes. It's a full load testing platform built for NBomber, not just a UI.
:::

### What does NBomber Cluster provide?

- **Scalability of load** — distributes scenarios across multiple nodes to generate more load than a single node can produce.
- Runs multiple scenarios on multiple nodes with flexible topology (**scenario placement strategy**).
- **Continuously collects metrics from all Agents and calculates overall statistics at runtime.** Threshold checks run on the Coordinator node.
- Collects hardware metrics (CPU, RAM, IO, etc.) from all Agents. These metrics can be used in threshold checks.
- Provides [auto partition assignment](data-partition) for the same scenario across the cluster. This is useful when you need to split data responsibility between Agent instances. Each Agent running the same scenario automatically receives a partition number (key range) that can be used to load, prepare, and work with its assigned data.
- Produces all report types (TXT, CSV, MD, HTML) with **summary across all nodes in the cluster**.
- Produces real-time reporting for the whole cluster.

<!-- startup Order for agents and coordinator -->

## Terminology

:::info
Cluster mode introduces two distinct roles: **Coordinator** (aka Leader) and **Agent** (aka Worker). To form a cluster, you need 1 Coordinator + N Agent(s).
Each NBomber instance (process) runs as either a **Coordinator** or an **Agent**. **There can be only one Coordinator per cluster, and the cluster cannot start without it.** You can run an unlimited number of independent clusters in parallel, each containing 1 Coordinator + N Agent(s). Cluster members discover each other by `ClusterId` (think of it as a virtual cluster id).
:::

### Coordinator
The Coordinator orchestrates the entire test. It can also execute scenarios, just like an Agent — you control which scenarios run where. This is useful for running a scenario as a singleton in the cluster (for example, periodically writing a message to Kafka). Alternatively, configure all scenarios to run only on Agents, leaving the Coordinator free to act purely as an orchestrator: fetching metrics from Agents and evaluating thresholds. In a JSON config, the `Coordinator` section is optional — by default the Coordinator runs no scenarios and acts purely as an orchestrator (the role still exists; only the config section is optional). See [Running scenarios on the Coordinator](run-cluster-json#running-scenarios-on-the-coordinator) if you want it to run scenarios too.
:::tip
Keeping the Coordinator free of heavy scenarios is recommended — an idle Coordinator won't distort your load test results.
:::

### Agent
The Agent executes load test scenarios and responds to commands from the Coordinator.

### Message Broker
The Message Broker is the communication hub of the cluster. All traffic between the Coordinator and Agents flows through it: the Coordinator sends commands to Agents, and Agents send metrics back for aggregation.