---
id: overview
title: Overview
sidebar_position: 0
---

import ClusterImage from './img/cluster.jpg'; 

<center><img src={ClusterImage} width="60%" height="60%" /></center>

NBomber Cluster is a feature of NBomber that allows running NBomber load tests in a distributed way (on multiple nodes) with flexible orchestration.

## Terminology

In the cluster mode, NBomber can run either as Coordinator (aka Leader) or Agent (aka Worker).

- `Coordinator` is a cluster role which is responsible for coordinating the execution of the entire test. The coordinator can be only one per cluster.
- `Agent` is a cluster role which is responsible for running load test scenarios and reacting to the commands from the coordinator.
- `Message Broker` is a communication point in the cluster. All network communication between Coordiantor and Agents goes via the message broker. Usually, it is used by the coordinator to send commands to agents. Also, agents can send metrics to the coordinator for further aggregation.

:::info
NBomber is using [NATS](https://nats.io/) message broker. The simplest way to [install](../getting-started/installation#install-nats-message-broker) it is using Docker.
:::

## Why do you need the cluster?

- **The capacity of single NBomber node is no longer enough** to create a relevant load, and you want to run load test scenarios on multiple nodes.

- **You want to get a flexible scenario placement strategy among available nodes.** With this feature, you can specify the placement for each scenario in the cluster. For example, you want to test some web service by running the `Create User` scenario on one group of nodes but the `Read User` scenario on the second. And on the third group of nodes, you run `Publish message to Kafka` scenario.

- **You want to run tests from different geographical regions to verify the latency.**

## What NBomber Cluster provides?

- It can run multiple scenarios on multiple nodes with flexible topology (scenario placement strategy).
- It grabs all metrics from multiple NBomber Agent(s) simultaneously and calculates overall statistics that can be used for test assertions.
- It grabs additional hardware metrics from all NBomber Agent(s) like CPU and RAM. All these metrics can be used for test assertions.
- It supports real-time reporting that, together with the tools like Grafana and Kibana, provides a central observability dashboard.
- It provides auto partition assignment for the same scenario in the cluster. It's a valuable feature when you want to assign some data range per Agent. In this way, each Agent that runs the same scenario will automatically receive a partition number(keys range) that can be used to load/prepare some data.
- It supports all(TXT, CSV, MD, HTML) report types.

## What are the limitations of NBomber Cluster?

- Is there a limit on the number of nodes in the cluster? No.
- Is there any limitation on the number of clusters that can run concurrently? No.

<!-- startup Order for agents and coordinator -->