---
id: custom-metrics
title: Custom Metrics
sidebar_position: 12
---

import CustomMetricsImage from './img/custom_metrics.jpg'; 
import CustomMetricsTabImage from './img/custom_metrics_tab.jpg'; 

<center><img src={CustomMetricsImage} width="75%" height="75%" /></center>

## Overview

Metrics are numerical measurements reported over time. By default, NBomber automatically collects built-in metrics: CPU, RAM (usage), Data (sent/receive), and more. Besides built-ins, you can also define custom metrics.

NBomber provides different types of custom metrics that you can use, depending on what you want to measure. These include:
- **Counter**: a cumulative count of events, such as the number of successful or failed requests.

```csharp
var counter = Metric.CreateCounter("my-counter", unitOfMeasure: "MB");
counter.Add(2); // tracks a value that may increase or decrease over time
counter.Add(-1);
```
- **Gauge**: measures the last value recorded, such as memory usage or the number of active users at a given time.

```csharp
var gauge = Metric.CreateGauge("my-gauge", unitOfMeasure: "KB");
gauge.Set(6.5);
gauge.Set(7.3); // set the current value of the metric
```

## Setting up Custom Metrics

Let's take a look at how you can define custom metrics in your code. In the following sections, you'll also learn how to add thresholds on top of them.

```csharp
// define custom metrics
var counter = Metric.CreateCounter("my-counter", unitOfMeasure: "MB");
var gauge = Metric.CreateGauge("my-gauge", unitOfMeasure: "KB");

var scenario = Scenario.Create("scenario", async context =>
{
    await Task.Delay(500);

    // highlight-start
    counter.Add(1); // tracks a value that may increase or decrease over time
    gauge.Set(6.5); // set the current value of the metric
    // highlight-end

    return Response.Ok();
})
.WithInit(ctx =>
{
    // register custom metrics
    // highlight-start
    ctx.RegisterMetric(counter);
    ctx.RegisterMetric(gauge);
    // highlight-end

    return Task.CompletedTask;
});

var stats = NBomberRunner
    .RegisterScenarios(scenario)
    .Run();

// we can retrieve the final metric values for further assertions
// highlight-start
var counterValue = stats.Metrics.Counters.Find("my-counter").Value;
var gaugeValue = stats.Metrics.Gauges.Find("my-gauge").Value;
// highlight-end
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/CustomMetrics/CustomMetricsExample.cs).*

## Viewing Custom Metrics in the HTML report

After running a load test, you will be able to view and check custom metric values in the HTML report.

<center><img src={CustomMetricsTabImage} width="80%" height="80%" /></center>

## Using Thresholds

While custom metrics give you quantitative insights, [Thresholds](asserts_and_thresholds.md) in NBomber allow you to validate specific conditions. Using thresholds helps ensure that the system’s behavior meets predefined performance standards.

Here’s how you can define thresholds for custom metrics:

```csharp
// define custom metrics
var counter = Metric.CreateCounter("my-counter", unitOfMeasure: "MB");
var gauge = Metric.CreateGauge("my-gauge", unitOfMeasure: "KB");

var scenario = Scenario.Create("scenario", async context =>
{
    ...
})
.WithInit(ctx =>
{
    // register custom metrics
    ctx.RegisterMetric(counter);
    ctx.RegisterMetric(gauge);

    return Task.CompletedTask;
})
.WithThresholds(
    // highlight-start
    Threshold.Create(metric => metric.Counters.Get("my-counter").Value < 1000),
    Threshold.Create(metric => metric.Gauges.Get("my-gauge").Value >= 6.5)
    // highlight-end
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/CustomMetrics/CustomMetricsExample.cs).*

## Using Thresholds via JSON Config

Additionaly, you can define [Thresholds](asserts_and_thresholds#runtime-thresholds-in-json-config) in [JSON Config](json-config.md) file.

```json title="nbomber-config.json"
{
    "GlobalSettings": {

        "ScenariosSettings": [
            {
                "ScenarioName": "scenario",

                "ThresholdSettings": [

                    { "Metric": ["my-counter", "value < 1000"] },
                    { "Metric": ["my-gauge", "value >= 6.5"] }

                ]
            }
        ]
    }
}
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/CustomMetrics/nbomber-config.json).*