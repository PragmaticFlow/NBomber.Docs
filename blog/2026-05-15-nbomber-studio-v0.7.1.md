---
title: NBomber Studio 0.7.1
tags: [nbomber-studio-release, load-testing]
draft: true
---

import ReactPlayer from 'react-player'
import NBStudioImage from './img/nb-studio-v0.6.2/nbomber-studio.jpg'

The new **0.7.1 release** introduces one small but powerful feature: **Load Tests in Kubernetes**.

Load Tests in Kubernetes give you a control plane for managing, deploying, and running load tests. With this feature, you can schedule and execute load tests in Kubernetes directly from NBomber Studio. It's a game changer that brings a SaaS-like experience while letting you run your tests inside your own private K8s cluster.

<center><img src={NBStudioImage} width="75%" /></center>

<!--truncate-->

## Load Tests in Kubernetes
Starting with this release, NBomber Studio lets you deploy and run tests in K8s. When you start a test, Studio spins up everything it needs — the Pods that run your load test, along with a NATS message broker for cluster mode. It also propagates your license key, the connection string for TimescaleDB, your JSON configuration, the container spec, and any CLI arguments you want to pass into your test. Once the test finishes, Studio cleans up the environment by destroying every resource it created during the session.

Let's take a look at the new capabilities. To create and run your test, we've added support for two project types:
- **C# Script** — best suited for simple load tests, demos, and dry runs where you want to test a few endpoints or a single microservice and get quick results. Its main benefit is that you can change the code on the fly without recompiling your scenario, which makes it ideal for trying out NBomber and iterating quickly.

- **Docker** — designed for production use cases. You provide a Docker image with your NBomber test, and Studio deploys it across as many Pods as you configure. You can also pass and dynamically edit the JSON configuration of your test scenarios.

## C# Script

<div className="video-container">
  <ReactPlayer
    src='https://youtu.be/tsFZSrL8GI8'
    controls
    loop
    style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
  />
</div>

## Docker

<div className="video-container">
  <ReactPlayer
    src='https://youtu.be/tsFZSrL8GI8'
    controls
    loop
    style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
  />
</div>

For more details, please check our [documentation](https://nbomber.com/docs/nbomber-studio/loadtests-in-k8s/overview).

## What's next

### Load Testing in Kubernetes
- F# Script support is coming a bit later.
- We're going to release a calendar scheduler that lets you run load tests at a specific time or on a recurring schedule (daily, weekly, etc.).
- More charts and design improvements are on the way.