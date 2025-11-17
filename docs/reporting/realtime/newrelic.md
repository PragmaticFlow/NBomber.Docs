---
id: newrelic
title: New Relic
sidebar_position: 6
---

# New Relic

[New Relic](https://newrelic.com) is an observability and monitoring platform that provides deep insights into your applications, infrastructure, and load testing results. It enables you to visualize performance metrics in real time and analyze historical data to detect trends, bottlenecks, and optimization opportunities.

To store metrics into New Relic, NBomber relies on [OpenTelemetry](https://docs.newrelic.com/docs/opentelemetry/opentelemetry-introduction/) — an open standard for collecting and exporting telemetry data. This allows you to seamlessly integrate NBomber with New Relic and leverage its powerful dashboards, charts, and alerting features.

## Example

Here's a simple example of how to configure OpenTelemetry for NBomber and send metrics to New Relic:

:::info
- You need to install [NBomber.Sinks.OpenTelemetry](./opentelemetry) package to send metrics via OTLP.
- You need to get [OTLP API endpoint of New Relic](https://docs.newrelic.com/docs/opentelemetry/best-practices/opentelemetry-otlp/) for accepting OTLP metrics.
:::

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
