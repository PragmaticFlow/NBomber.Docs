---
id: dynatrace
title: Dynatrace
sidebar_position: 7
---

# Dynatrace

[Dynatrace](https://www.dynatrace.com) is an observability and application performance monitoring platform that provides intelligent insights into your systems, services, and load testing results. It enables you to monitor performance in real time, detect anomalies automatically, and analyze historical data to optimize application reliability and efficiency.

To work with Dynatrace, NBomber can send load test metrics using [OpenTelemetry](opentelemetry) — an open standard for collecting and exporting telemetry data. This allows you to seamlessly integrate NBomber with Dynatrace and take advantage of its AI-powered analytics, dashboards, and alerting capabilities.

By using Dynatrace together with OpenTelemetry, you can:

- Collect and visualize NBomber load test metrics in real time  
- Correlate load test results with application and infrastructure performance  
- Analyze historical data for trend detection and optimization  
- Automatically detect anomalies and performance degradation with Dynatrace Davis AI  
- Set up custom dashboards and alerting rules for performance thresholds  

## Example

Here’s a simple example of how to send OpenTelemetry data from your application to Dynatrace:

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithoutReports()
    .WithReportingSinks(new OpenTelemetrySink(new()
    {
        Endpoint = new Uri("https://{your-environment-id}.live.dynatrace.com/api/v2/otlp/v1/metrics"),
        Protocol = OtlpExportProtocol.HttpProtobuf,
        Headers = "Authorization=Api-Token {your-api-token}",
    }))
    .Run();
```