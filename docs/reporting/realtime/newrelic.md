---
id: newrelic
title: New Relic
sidebar_position: 8
---

# New Relic

[New Relic](https://newrelic.com) is an observability and monitoring platform that provides deep insights into your applications, infrastructure, and load testing results. It enables you to visualize performance metrics in real time and analyze historical data to detect trends, bottlenecks, and optimization opportunities.

To work with New Relic, NBomber can send load test metrics using [OpenTelemetry](opentelemetry) — an open standard for collecting and exporting telemetry data. This allows you to seamlessly integrate NBomber with New Relic and leverage its powerful dashboards, charts, and alerting features.

By using New Relic together with OpenTelemetry, you can:

- Collect and visualize NBomber load test metrics in real time
- Correlate load test data with system and application performance metrics
- Analyze historical data for trend detection and optimization
- Set up alerts for performance thresholds
- Use NRQL (New Relic Query Language) to create custom dashboards and queries

## Example

Here’s a simple example of how to send OpenTelemetry data from your application to New Relic:

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithoutReports()
    .WithReportingSinks(new OpenTelemetrySink(new()
    {
        Endpoint = new Uri("https://otlp.eu01.nr-data.net"),
        Headers = "api-key={YOUR_API_KEY}"
    }))
    .Run();
```
