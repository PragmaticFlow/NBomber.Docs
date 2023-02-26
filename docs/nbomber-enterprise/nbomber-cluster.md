---
id: nbomber-cluster
title: NBomber Cluster
sidebar_position: 0
---

import ClusterImage from './img/cluster.jpg'; 

<center><img src={ClusterImage} width="80%" height="80%" /></center>

NBomber Cluster is an additional runtime component that can run NBomber load tests in a distributed way (on multiple nodes) with flexible orchestration.

:::info
We assume that you are already familiar with the basics of NBomber API and can create and run simple load tests. Also, you should be familiar with configuring your tests via [JSON configuration](../using-nbomber/basic-api/json-config).
:::

## Why do you need the cluster?

- **The capacity of single NBomber node is no longer enough** to create a relevant load, and you want to run load test scenarios on multiple nodes.

- **You want to get a flexible scenario placement strategy among available nodes.** With this feature, you can specify the placement for each scenario in the cluster. For example, you want to test some web service by running the `Create User` scenario on one group of nodes but the `Read User` scenario on the second. And on the third group of nodes, you run `Publish message to Kafka` scenario.

## What NBomber Cluster provides?

- It can run multiple scenarios on multiple nodes with flexible topology (scenario placement strategy).
- It grabs all metrics from multiple NBomber Agent(s) simultaneously and calculates overall statistics that can be used for test assertions.
- It grabs additional hardware metrics from all NBomber Agent(s) like CPU and RAM. All these metrics can be used for test assertions.
- It supports real-time reporting that, together with the tools like Grafana and Kibana, provides a central observability dashboard.
- It provides auto partition assignment for the same scenario in the cluster. It's a valuable feature when you want to assign some data range per Agent. In this way, each Agent that runs the same scenario will automatically receive a partition number(keys range) that can be used to load/prepare some data.
- It supports all(TXT, CSV, MD, HTML) report types.

### What are the limitations of NBomber Cluster?

- Is there a limit on the number of nodes in the cluster? No.
- Is there any limitation on the number of clusters that can run concurrently? No.

### What are the API-level differences between NBomber Cluster and NBomber?

The main differnce is that NBomber Cluster is using `NBomberClusterRunner` instead of  `NBomberRunner`. NBomberClusterRunner provides additional settings related to running scenarios in a cluster. Also, the `JSON Config` is a bit extended for NBomber Cluster to provide a few additional settings for scenario placement in the cluster.