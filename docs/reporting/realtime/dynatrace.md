---
id: dynatrace
title: Dynatrace
sidebar_position: 2
---

# Dynatrace

[Dynatrace](https://www.dynatrace.com) is an observability and application performance monitoring platform that provides intelligent insights into your systems, services, and load testing results. It enables you to monitor performance in real time, detect anomalies automatically, and analyze historical data to optimize application reliability and efficiency.

To store metrics into Dynatrace, NBomber relies on [OpenTelemetry](https://docs.dynatrace.com/docs/ingest-from/opentelemetry) — an open standard for collecting and exporting telemetry data. This allows you to seamlessly integrate NBomber with Dynatrace and take advantage of its AI-powered analytics, dashboards, and alerting capabilities.

## Example

Here's a simple example of how to configure OpenTelemetry for NBomber and send metrics to Dynatrace:

:::info
- You need to install [NBomber.Sinks.OpenTelemetry](./opentelemetry) package to send metrics via OTLP.
- You need to get [OTLP API endpoint of Dynatrace](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/otlp-api) for accepting OTLP metrics.
:::

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithoutReports()
    .WithReportingSinks(new OpenTelemetrySink(new()
    {
        Endpoint = new Uri("https://{your-environment-id}.live.dynatrace.com/api/v2/otlp/v1/metrics"),
        Protocol = OtlpExportProtocol.HttpProtobuf,
        Headers = "Authorization=Api-Token {YOUR_API_KEY}",
    }))
    .Run();
```