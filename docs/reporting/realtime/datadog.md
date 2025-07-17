---
id: datadog
title: Datadog
sidebar_position: 3
draft: true
---

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

Typically the integration with Datadog is handled via Datadog Agent. Datadog Agent is a daemon which supports the StatsD protocol over UDP.

### Configuring Datadog Sink via JSON Config

To configure Datadog Sink we will use [JSON Infrastracture Config](/docs/nbomber/json-config.md#json-infrastracture-config) file

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

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/RealtimeReporting/InfluxDB).*

### Saving custom metrics to Datadog

There could be cases where you want to write your custom raw metrics to InfluxDB. Here is an example of how you can use InfluxDB sink to write your custom data.

```csharp
var influxDbSink = new InfluxDBSink();

var scenario = Scenario.Create("scenario", async context =>
{    
    var writeApi = influxDbSink.InfluxClient.GetWriteApiAsync();

    var point = PointData
        .Measurement("nbomber")
        .Field("my_custom_counter", 1);

    await writeApi.WritePointAsync(point);

    return Response.Ok();
});
```

*By following this link, you can get more info about [InfluxClient](https://github.com/influxdata/influxdb-client-csharp).*

### Connecting to Datadog via code

You might have a situation that requires you to connect to InfluxDB via code. For this, you can inject an instance of InfluxDBClient.

For InfluxDB v1:
```csharp
var influxDbSink = new InfluxDBSink(
    new InfluxDBClient("http://localhost:8086", "username", "password", "database", retentionPolicy: "autogen")
);
```