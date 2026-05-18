---
id: overview
title: Overview
hide_title: true
sidebar_position: 1
---

import NbK8sImage from './../img/nb-studio-load-test-in-k8s.jpg'

<center><img src={NbK8sImage} width="1000%" /></center>

**Load Tests in Kubernetes** provides a control plane for managing, deploying, and running load tests. With this feature, you can schedule and execute load tests in Kubernetes directly from NBomber Studio. When you start a test, Studio spins up all the necessary dependencies — such as the NATS message broker and the Pods that run your load test. Once the test finishes, Studio cleans up the environment by destroying every resource it created during the session.

NBomber Studio currently supports the following project types:

- [**C# Script**](csharp-script) — best suited for simple load tests, demos, and dry runs where you want to test a few endpoints or a single microservice and get quick results. Its main benefit is that you can change the code on the fly without recompiling your scenario, which makes it ideal for trying out NBomber and iterating quickly.

- **F# Script** — *in development.*

- [**Docker**](docker) — designed for production use cases. You provide a Docker image with your NBomber test, and Studio deploys it across as many Pods as you configure. You can also pass and dynamically edit the JSON configuration of your test scenarios.