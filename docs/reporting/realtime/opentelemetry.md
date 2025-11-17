---
id: opentelemetry
title: OpenTelemetry
sidebar_position: 7
---

import OpenTelemetryImage from './img/opentelemetry.jpg';
import AspireDataImage from './img/aspire-data.jpg';

<center><img src={OpenTelemetryImage} width="75%" height="75%" /></center>

[OpenTelemetry](https://opentelemetry.io/) is an open-source observability framework that provides standardized APIs, SDKs, and tools for instrumenting, generating, collecting, and exporting telemetry data — including metrics, logs, and traces. It helps developers and operators gain unified visibility into distributed systems by allowing telemetry to be exported to different backends such as Prometheus, Grafana, or Jaeger.

Using [Reporting Sinks](/docs/nbomber/reporting-sinks.md), you can store **NBomber** metrics through OpenTelemetry and visualize them in your preferred observability platform. This integration enables real-time insights into your load test performance and system behavior.

:::warning
This package is experimental and might be subject to breaking API changes in the future. While we intend to keep experimental packages as stable as possible, we may need to introduce breaking changes.
:::

:::info
You can find the [source code here](https://github.com/PragmaticFlow/NBomber.Sinks.OpenTelemetry).

To start working with the [NBomber.Sinks.OpenTelemetry](https://www.nuget.org/packages/NBomber.Sinks.OpenTelemetry) package, install it via NuGet:

[![build](https://github.com/PragmaticFlow/NBomber.Sinks.OpenTelemetry/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.Sinks.OpenTelemetry)
[![NuGet](https://img.shields.io/nuget/v/NBomber.Sinks.OpenTelemetry.svg)](https://www.nuget.org/packages/NBomber.Sinks.OpenTelemetry/)

```
dotnet add package NBomber.Sinks.OpenTelemetry
```
:::

## Integrating with OpenTelemetry

OpenTelemetry provides a unified way to send telemetry data to multiple backends using the OTLP (OpenTelemetry Protocol). There are two common options it can be integrated: 
- Send metrics directly to an OpenTelemetry-compatible endpoint.
- Send metrics to a local or remote OpenTelemetry [Collector](https://opentelemetry.io/docs/collector/). The Collector then forwards the telemetry to your observability backend.

In both approaches, from the NBomber perspective, we simply need to configure the OTLP endpoint to which the NBomber sink will send metrics.

## Export metrics directly to an OpenTelemetry-compatible endpoint

This is probably the simplest integration approach. In this approach, NBomber sends metrics directly to the observability platform using the OpenTelemetry Protocol (OTLP).

How it works:
- The sink is configured with the URL of a remote OTLP endpoint (HTTP or gRPC).
- Metrics are serialized in OTLP format and transmitted over the network.
- The observability backend receives and processes the data without requiring intermediate components.

Pros:
- Simplified architecture—no additional infrastructure required.
- Lower operational overhead.

Example: In this example, we will run the `aspire-dashboard` Docker image, which will act as an OTLP endpoint as well as a metrics dashboard.

```yaml title="docker-compose.yaml"
services:
aspire-dashboard:
    image: mcr.microsoft.com/dotnet/aspire-dashboard:latest
    ports:
        - "18888:18888"
        - "18889:18889"     
```

To spin up aspire-dashboard locally, run the CLI command in the folder containing the `docker-compose.yaml` file.

```
docker compose up -d
```

The container exposes two ports:
- Port `18889` to receives OpenTelemetry data from apps. Apps (NBomber test) send data using OpenTelemetry Protocol (OTLP).
- Port `18888` has the dashboard UI. Navigate to http://localhost:18888 in the browser to view the dashboard.

After this you should [login to the Aspire dashboard](https://aspire.dev/dashboard/standalone/#login-to-the-dashboard).

Now you are ready to run the NBomber test and view the real-time metrics in the Aspire dashboard.

```csharp
var stats = NBomberRunner
    .RegisterScenarios(scenario)        
    .WithReportingSinks(
        new OpenTelemetrySink(new OtlpExporterOptions
        {
            Endpoint = new Uri("http://localhost:18889"),
            Protocol = OtlpExportProtocol.Grpc
        })
    )
    .Run();
```

Also, you can configure OpenTelemetrySink via JSON Config.

```json title="infra-config.json"
{
    "OpenTelemetrySink": {
        "Endpoint": "http://localhost:18889",
        "Protocol": "Grpc" // Grpc, HttpProtobuf
    }
}
```

Now you should load **"infra-config.json"** file.

```csharp
var stats = NBomberRunner
    .RegisterScenarios(scenario)
    .LoadInfraConfig("./infra-config.json")    
    .WithReportingSinks(new OpenTelemetrySink())
    .Run();
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/RealtimeReporting/OpenTelemetry)*.

While the load test is running, Aspire displays NBomber’s metrics in real time, helping you observe throughput, latency, and other key performance indicators as they evolve.

<center><img src={AspireDataImage} width="100%" height="100%" /></center>