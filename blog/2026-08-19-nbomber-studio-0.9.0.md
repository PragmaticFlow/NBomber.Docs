---
title: NBomber Studio 0.9.0
tags: [nbomber-studio-release, load-testing]
---

import ReactPlayer from 'react-player'
import LogsImage from './img/nb-studio-v0.9.0/logs.jpg'
import ScnNavigationImage from './img/nb-studio-v0.9.0/scenarios_navigation.jpg'
import DataTransferImage from './img/nb-studio-v0.9.0/data_transfer.jpg'
import ChartTableImage from './img/nb-studio-v0.9.0/chart_table.jpg'
import TooltipImage from './img/nb-studio-v0.9.0/tooltip.jpg'

**NBomber Studio 0.9.0** is out! This release adds a **Logs tab** that shows the logs of every node of your test. It also adds a **Data Transfer chart**, a **metric table under every chart**, and a new navigation for scenarios and steps.

<div className="video-container">
  <ReactPlayer
    src='https://www.youtube.com/watch?v=mtMo6R8zL_A'
    controls
    loop
    style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
  />
</div>

<!--truncate-->

## New Logs tab

<center><img src={LogsImage} width="100%" /></center>

The Session Details view has a new **Logs** tab. Studio reads the logs of the session and shows them in the browser. You no longer download the artifacts archive and unpack it on your machine.

:::info
This functionality requires [NBomber v6.6.0](https://www.nuget.org/packages/NBomber/6.6.0) and [NBomber.Sinks.Timescale 0.14.0](https://www.nuget.org/packages/NBomber.Sinks.Timescale/0.14.0)
:::


**A console-style viewer.** The selected file opens in a log console with line numbers, timestamps, and a color-coded level badge (`Verbose`, `Debug`, `Information`, `Warning`, `Error`, `Fatal`). A stack trace stays attached to the log entry that produced it. It does not break into separate unparsed lines.

## Session Details: new navigation

<center><img src={ScnNavigationImage} width="100%" /></center>

The biggest visual change is the navigation of the Session Details view. We replaced the old sidebar with a **resizable tree of your scenarios and their steps**.

- When you select a scenario or a step in the tree, the tabs show the data of this selection only. This applies to the **Summary**, **Status codes**, **Charts**, **Failures**, and **Custom Metrics** tabs.
- You can **collapse** the tree, or **drag its border** to change the width.

The **Logs** tab uses the same control for its list of log files. The navigation is therefore consistent across the whole view.

We also corrected two problems of the old layout. The page no longer jumps when you switch tabs, and the navbar stays visible.

## New Data Transfer chart

<center><img src={DataTransferImage} width="100%" /></center>

The **Charts** tab has a new **Data Transfer** chart. It shows the network throughput over time. The chart gives the amount of data per second for the successful (`Ok`) requests, the failed (`Fail`) requests, and all (`Total`) requests.

The data transfer metrics are also part of the **Summary** table now.

:::info
To see this chart, update `NBomber.Sinks.Timescale` to version 0.14.0.
:::

## A metric table under every chart

<center><img src={ChartTableImage} width="100%" /></center>

The **Throughput**, **Latency**, and **Data Transfer** charts each have a table below the chart. One row is one scenario or one step. Each row has a color mark that matches the line on the chart, so you can map the numbers to the lines. You do not need the legend.

Every metric has two values:

- **final** - the value for the whole run. For an active session, it is the most recent data point.
- **peak** - the highest value of the run.

## Tooltips everywhere

<center><img src={TooltipImage} width="40%" /></center>

An **info icon near each chart title** explains what the chart shows. Each **column header of a metric table** explains its metric. The .NET process metrics have the same tooltips: CPU usage, memory working set, GC heap size, GC LOH size, time in GC, thread pool queue length, thread count, and DNS lookups.

## Better chart scale

The charts now calculate the maximum of the Y axis from the peak value of the series. Before this change, a custom metric with large values made the main lines flat at the bottom of the chart.

## 📦 Docker image & Helm chart

NBomber Studio is available as a Docker image and a Helm chart:
- Docker Hub: [nbomberdocker/nbomber-studio](https://hub.docker.com/repository/docker/nbomberdocker/nbomber-studio/general)
- Helm chart: [nbomber-studio](https://artifacthub.io/packages/helm/nbomber-studio/nbomber-studio) ([source](https://github.com/PragmaticFlow/nbomber-studio-helm))

<!-- ## What's next

- Read our [Roadmap](https://nbomber.com/docs/getting-started/roadmap) to see what we plan for the next release. -->
