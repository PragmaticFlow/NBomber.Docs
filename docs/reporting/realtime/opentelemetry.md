---
id: opentelemetry
title: OpenTelemetry
sidebar_position: 4
---

import OpenTelemetryImage from './img/aspire-data.jpg';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[OpenTelemetry](https://opentelemetry.io/) is an open-source observability framework that provides standardized APIs, SDKs, and tools for instrumenting, generating, collecting, and exporting telemetry data — including metrics, logs, and traces. It helps developers and operators gain unified visibility into distributed systems by allowing telemetry to be exported to different backends such as Prometheus, Grafana, or Jaeger.

Using [Reporting Sinks](/docs/nbomber/reporting-sinks.md), you can store **NBomber** metrics through OpenTelemetry and visualize them in your preferred observability platform. This integration enables real-time insights into your load test performance and system behavior.

:::info
You can find the [source code here](https://github.com/PragmaticFlow/NBomber.Sinks.OpenTelemetry).

To start working with the [NBomber.Sinks.OpenTelemetry](https://www.nuget.org/packages/NBomber.Sinks.OpenTelemetry) package, install it via NuGet:

[![build](https://github.com/PragmaticFlow/NBomber.Sinks.OpenTelemetry/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.Sinks.OpenTelemetry)
[![NuGet](https://img.shields.io/nuget/v/NBomber.Sinks.OpenTelemetry.svg)](https://www.nuget.org/packages/NBomber.Sinks.OpenTelemetry/)

```bash
dotnet add package NBomber.Sinks.OpenTelemetry
```
:::

## Integrating with OpenTelemetry

OpenTelemetry provides a unified way to send telemetry data to multiple backends using the OTLP (OpenTelemetry Protocol).
The most common deployment pattern involves using the OpenTelemetry Collector — a lightweight service that receives, processes, and exports telemetry data.

The Collector acts as an intermediary between your application (NBomber in this case) and your monitoring backend. It can receive telemetry over gRPC or HTTP and forward it to destinations such as Prometheus, Grafana, Datadog, or others.

We recommend using Docker to install the OpenTelemetry Collector locally, as it is portable and simple to configure.
Refer to the official [OpenTelemetry Collector installation guide](https://opentelemetry.io/docs/collector/installation/) for setup instructions.

<Tabs>
  <TabItem value="info1" label="With OpenTelemetry Collector" default>
    ### docker-compose.yaml
    ```yaml
    services:
    otel-collector:
        image: otel/opentelemetry-collector-contrib:0.138.0
        container_name: otel-collector
        restart: unless-stopped
        volumes:
        - ./config.yaml:/etc/otelcol/config.yaml:ro
        command: ["--config=/etc/otelcol/config.yaml"]
        ports:
        - "4317:4317"    # OTLP gRPC input (apps send data here)
        - "4318:4318"    # OTLP HTTP input (optional)

    aspire-dashboard:
        image: mcr.microsoft.com/dotnet/aspire-dashboard:latest
        container_name: aspire-dashboard
        restart: unless-stopped
        ports:
        - "18888:18888"  # Web UI
        - "18889:18889"  # OTLP gRPC receiver (Collector sends data here)
        - "18890:18890"  # OTLP HTTP receiver (optional)
    ```
    ### config.yaml
    ```yaml
    receivers:
    otlp:
        protocols:
        grpc:
            endpoint: 0.0.0.0:4317
        http:
            endpoint: 0.0.0.0:4318

    processors:
    batch: {}

    exporters:
    otlp:
        endpoint: "aspire-dashboard:18889"
        tls:
        insecure: true

    service:
    pipelines:
        metrics:
        receivers: [otlp]
        processors: [batch]
        exporters: [otlp]
    ```
  </TabItem>

  <TabItem value="info2" label="Direct to Aspire Dashboard">
    ### docker-compose.yaml
    ```yaml
    services:
    aspire-dashboard:
        image: mcr.microsoft.com/dotnet/aspire-dashboard:latest
        ports:
            - "18888:18888"
            - "18889:18889" 
        volumes:
            - aspire-data:/aspire

    volumes:
        aspire-data:
    ```
  </TabItem>
</Tabs>

## Configuring OpenTelemetry Sink via JSON Config

To send NBomber metrics to the OpenTelemetry Collector, initialize and configure the OpenTelemetrySink.
This can be done via the JSON Infrastructure Config file.

 ```json title="infra-config.json"
{
    "OpenTelemetrySink": {
      "Endpoint": "http://localhost:4317",
      "Protocol": "Grpc" // Grpc, HttpProtobuf
    }
}
```
Now you should load this **"infra-config.json"** file.

```csharp
var openTelemetrySink = new OpenTelemetrySink();

var scenario = Scenario.Create("scenario", async context => { ... });

NBomberRunner
    .RegisterScenarios(scenario)
    .WithReportingInterval(TimeSpan.FromSeconds(5))
    .WithReportingSinks(openTelemetrySink)
    .LoadInfraConfig("infra-config.json");
```

You can find the complete example by this link.

While the load test is running, Aspire displays NBomber’s metrics in real time, helping you observe throughput, latency, and other key performance indicators as they evolve.

<center><img src={OpenTelemetryImage} width="100%" height="100%" /></center>

### Connecting to OpenTelemetry via code

You might have a situation that requires you to connect to OpenTelemetry via code.

```csharp
var openTelemetry = new OpenTelemetrySink(new ()
{
    Endpoint = "http://localhost:4317",
    Protocol = OtlpExportProtocol.Grpc
});
```
