---
id: http-metrics-plugin
title: HttpMetricsPlugin
sidebar_position: 3
---

import ConsoleMetricsImage from './img/console_metrics.jpg';
import HTMLHistoryMetricsImage from './img/html_history_metrics.jpg';

HttpMetricsPlugin - is an optional plugin that provides a monitoring layer for HTTP connections opened by load test. It is included with the [NBomber.Http](https://www.nuget.org/packages/nbomber.http) package.

<center><img src={ConsoleMetricsImage} width="50%" height="50%" /></center>

To use HttpMetricsPlugin, you need to register it through NBomberRunner.

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithWorkerPlugins(new HttpMetricsPlugin([HttpVersion.Version1]))    
    .Run();
```

Additionally, when running with HttpMetricsPlugin, you'll get HTTP connection history metrics included in the HTML report.

<center><img src={HTMLHistoryMetricsImage} width="100%" height="100%" /></center>