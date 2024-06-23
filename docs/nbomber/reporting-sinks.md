---
id: reporting-sinks
title: Reporting Sinks
sidebar_position: 8
---

import ReportingSinksImage from './img/reporting-sinks.jpeg';

<center><img src={ReportingSinksImage} width="100%" height="100%" /></center>

ReportingSink is a pluggable functionality that NBomber uses to save real-time metrics and final statistics. With this functionality, you can add any storage support that you would like to use with NBomber. The available sinks:

- [NBomber.Sinks.InfluxDB](../reporting-sinks/influx-db) - reporting sink that writes real-time metrics and final statistics to InfluxDB.

## Implementing custom Reporting Sink

In case you need to add your custom Reporting Sink for your database storage that is not yet supported. Or maybe you want to enrich statistics data with your tags, metadata, etc. For this you should implement **IReportingSink** interface.

```csharp
public interface IReportingSink : IDisposable
{
    Task Init(IBaseContext context, IConfiguration infraConfig);
    Task Start();
    Task SaveRealtimeStats(ScenarioStats[] stats);
    Task SaveFinalStats(NodeStats stats);
    Task Stop();
}
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/RealtimeReporting/CustomReportingSink/CustomReportingSink.cs).*