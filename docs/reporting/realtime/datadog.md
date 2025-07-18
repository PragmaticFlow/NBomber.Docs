---
id: datadog
title: Datadog
sidebar_position: 3
---

import DataDogImage from './img/datadog.jpg';

<center><img src={DataDogImage} width="65%" height="65%" /></center>

[Datadog](https://www.datadoghq.com/) is a cloud-based monitoring and analytics platform that provides comprehensive observability into applications, infrastructure, and security. Datadog focuses on providing real-time visibility into your entire technology stack, including infrastructure, applications, and security.

Using [Reporting Sinks](/docs/nbomber/reporting-sinks.md), you can store NBomber metrics into Datadog and analyze your performance results with native [Datadog's Real-time Interactive Dashboards](https://www.datadoghq.com/product/platform/dashboards/).

:::info
You can find the [source code here](https://github.com/PragmaticFlow/NBomber.Sinks.Datadog).

To start working with [NBomber.Sinks.Datadog](https://www.nuget.org/packages/NBomber.Sinks.Datadog) package you should install it:

[![build](https://github.com/PragmaticFlow/NBomber.Sinks.Datadog/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.Sinks.Datadog)
[![NuGet](https://img.shields.io/nuget/v/NBomber.Sinks.Datadog.svg)](https://www.nuget.org/packages/NBomber.Sinks.Datadog/)

```code
dotnet add package NBomber.Sinks.Datadog
```
:::

## Integrating with Datadog

Typically, integration with Datadog is handled via the [Datadog Agent](https://docs.datadoghq.com/agent/). The Datadog Agent is a lightweight daemon that runs on your hosts. It collects events and metrics from the host and sends them to Datadog, where you can monitor performance, analyze data, and create visualizations and alerts. The Agent supports the StatsD protocol and listens on UDP port 8125 by default. When it receives metric data from applications, it forwards that data to Datadog for processing and display. 

We recommend using Docker to install the Datadog Agent locally, as it's the simplest and most portable method. Please refer to the following [instructions for installation](https://docs.datadoghq.com/integrations/docker/).

### Configuring Datadog Sink via JSON Config

To start sending metrics to the Datadog Agent, you need to initialize and configure `DatadogSink`. To configure `DatadogSink` we will use [JSON Infrastracture Config](/docs/nbomber/json-config.md#json-infrastracture-config) file.

```json title="infra-config.json"
{
    "DatadogSink": {
      "StatsdServerName": "localhost",
      "StatsdPort": 8125
    }
}
```

Now you should load this **"infra-config.json"** file.

```csharp
var datadog = new DatadogSink();

var scenario = Scenario.Create("scenario", async context => { ... });

NBomberRunner
    .RegisterScenarios(scenario)    
    .WithReportingInterval(TimeSpan.FromSeconds(5))
    .WithReportingSinks(datadog)
    // highlight-start
    .LoadInfraConfig("infra-config.json");
    // highlight-end
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/RealtimeReporting/Datadog).*

### Connecting to Datadog via code

You might have a situation that requires you to connect to Datadog via code.

```csharp
var datadog = new DatadogSink(new StatsdConfig {
    new StatsdConfig { StatsdServerName = "localhost", StatsdPort = 8125 }
});
```