---
id: timescale
title: TimescaleDB
sidebar_position: 1
---

Using [Reporting Sinks](/docs/nbomber/reporting-sinks.md), you can store NBomber metrics in [TimescaleDB](https://www.timescale.com/) and analyze your performance results with [NBomber.MetricsUI](https://github.com/PragmaticFlow/NBomber.MetricsUI) (*in development*) or [Grafana](https://grafana.com/).

:::warning
This package is experimental and might be subject to breaking API changes in the future. While we intend to keep experimental packages as stable as possible, we may need to introduce breaking changes.
:::

:::info
To start working with [NBomber.Sinks.Timescale](https://www.nuget.org/packages/NBomber.Sinks.Timescale) package you should install it:

[![build](https://github.com/PragmaticFlow/NBomber.Sinks.Timescale/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.Sinks.Timescale)
[![NuGet](https://img.shields.io/nuget/v/NBomber.Sinks.Timescale.svg)](https://www.nuget.org/packages/NBomber.Sinks.Timescale/)

```code
dotnet add package NBomber.Sinks.Timescale
```

Also, the [source code is available on Github](https://github.com/PragmaticFlow/NBomber.Sinks.Timescale).
:::

## Integrating with TimescaleDB

:::info
The simple way to run TimescaleDB is via Docker. By this link, you can find a [docker-compose.yaml](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/RealtimeReporting/TimescaleDB/docker-compose.yml) to run it.

:::

### Configuring TimescaleDB Sink via JSON Config

To configure TimescaleDB Sink we will use [JSON Infrastracture Config](/docs/nbomber/json-config.md#json-infrastracture-config) file

```json title="infra-config.json"
{
  "TimescaleDbSink": {
    "ConnectionString": "Host=localhost;Port=5432;Database=metricsdb;Username=timescaledb;Password=timescaledb;Pooling=true;Maximum Pool Size=300;"
  }
}
```

Now you should load this **"infra-config.json"** file.

```csharp
var timescaleDbSink = new TimescaleDbSink();

var scenario = Scenario.Create("scenario", async context => { ... });

NBomberRunner
    .RegisterScenarios(scenario)    
    .WithReportingInterval(TimeSpan.FromSeconds(5))
    .WithReportingSinks(timescaleDbSink)
    // highlight-start
    .LoadInfraConfig("infra-config.json");
    // highlight-end
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/RealtimeReporting/TimescaleDB).*

### Connecting to TimescaleDB via code

You might have a situation that requires you to connect to TimescaleDB via code.

```csharp
var timescaleDbSink = new TimescaleDbSink("Host=localhost;Port=5432;Database=metricsdb;Username=timescaledb;Password=timescaledb;Pooling=true;Maximum Pool Size=300;");
```

### Saving custom metrics to TimescaleDB

*This feature is in development...*