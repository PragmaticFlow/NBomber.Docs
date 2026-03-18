---
title: NBomber Studio 0.6.2
tags: [nbomber-release, load-testing]
---

import ReactPlayer from 'react-player'
import NBStudioImage from './img/nb-studio-v0.6.2/nbomber-studio.jpg'

The new **0.6.2 release** introduces several powerful features: **Compare Runs**, **Trend Analysis**, **Download HTML Report**, and **Stop Session**.

With these additions, [NBomber Studio](https://nbomber.com/docs/nbomber-studio/overview) is evolving beyond being just a UI for NBomber metrics into a full-fledged load testing platform. We are also working on the upcoming Load Testing in Kubernetes feature, which we expect to release in April.

<center><img src={NBStudioImage} width="75%" /></center>

<!--truncate-->

## Authentication enabled by default
Starting with this release, NBomber Studio enables authentication by default. You can configure authentication settings to add new members, disable authentication entirely, or enable OIDC for external identity providers. 

:::info
NBomber Studio doesn’t store user credentials.
:::

<div className="video-container">
  <ReactPlayer
    src='https://youtu.be/tsFZSrL8GI8'
    controls
    loop
    style={{ width: '80%', height: 'auto', aspectRatio: '16/9' }}
  />
</div>

*For more info please refer to [this page](https://nbomber.com/docs/nbomber-studio/config/auth).*

## Compare Runs
Compare runs lets you select up to five load test sessions and compare them across multiple dimensions — latency, throughput, status codes, and more. You can quickly identify differences through percentage comparisons or explore detailed comparison charts for deeper analysis.

<div className="video-container">
  <ReactPlayer
    src='https://youtu.be/vyMVYH0JxKo'
    controls
    loop
    style={{ width: '80%', height: 'auto', aspectRatio: '16/9' }}
  />
</div>

## Trend Analysis
Trend analysis is particularly useful for teams that want to track load test performance over longer periods, such as several months or even a full year. You'll see a degradation curve based on load test metrics summarized per day and plotted across the entire period.

<div className="video-container">
  <ReactPlayer
    src='https://youtu.be/C-0iCClKNbk'
    controls
    loop
    style={{ width: '80%', height: 'auto', aspectRatio: '16/9' }}
  />
</div>

## Stop Session
Sometimes you may start a load test and later decide to stop it to adjust settings or investigate an issue. Now you can simply select a session and click Stop.

:::info
This feature requires NBomber 6.3 and TimescaleSink 0.12 or later.
:::

<div className="video-container">
  <ReactPlayer
    src='https://youtu.be/VHyf5TQ8ZAI'
    controls
    loop
    style={{ width: '80%', height: 'auto', aspectRatio: '16/9' }}
  />
</div>

## Download HTML Report
Sharing load test results previously required storing generated HTML reports separately. Now you can directly download an HTML report from NBomber Studio using the **Download HTML Report** option for any completed session.

:::info
This feature requires NBomber 6.3 and TimescaleSink 0.12 or later.
:::

<div className="video-container">
  <ReactPlayer
    src='https://youtu.be/8c63ePhvaDs'
    controls
    loop
    style={{ width: '80%', height: 'auto', aspectRatio: '16/9' }}
  />
</div>

## Helm Charts
We’ve published two Helm charts to simplify installation in Kubernetes:

- [TimescaleDB Chart](https://artifacthub.io/packages/helm/timescale/timescale) for running a single-node PostgreSQL (TimescaleDB OSS) used by NBomber Studio
- [NBomber Studio Chart](https://artifacthub.io/packages/helm/nbomber-studio/nbomber-studio) for deploying a single-node instance of NBomber Studio

These charts make it much easier to set up NBomber Studio in Kubernetes environments. 
*You can find more info about installation on [this page](https://nbomber.com/docs/nbomber-studio/installation).*

## What's next

### Load Testing in Kubernetes
We are putting the finishing touches on the feature: **Load Testing in K8s**. This will allow you to create and deploy load tests directly to Kubernetes from NBomber Studio, without requiring additional CI/CD jobs. We expect this to be released in April.