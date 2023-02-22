---
id: logger
title: Logger
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import LoggerImage from './img/logger.jpg'; 

<center><img src={LoggerImage} width="80%" height="80%" /></center>

NBomber provides a modern approach for logging any interested event/data under load tests. 

## NBomber Logger Architecture

The core of NBomber's logging mechanism is based on the open-source logger library - [Serilog](https://serilog.net/). The benefit of using Serilog is its flexibility and extensibility. Serilog logger provides many [sinks](https://github.com/serilog/serilog/wiki/Provided-Sinks) that allow storing logs not only in text files but also in databases(Elasticsearch, MongoDB, etc.) and data platforms. From the architecture standpoint NBomber contains two loggers:

- **Console Logger** - This is the internal NBomber's logger used to print logs on the console terminal. Since this logger is internal, it can't be customized or overridden. In other words, the user can't use it. It logs the most important NBomber information/warning/error events.
- **Public Logger** - This logger is publicly available and exposed to users. By default, it writes logs to text files in the reports folder. This logger can be fully customized. For example, the log level/format can be changed; some log messages can be filtered, etc. Also, any [Serilog sink](https://github.com/serilog/serilog/wiki/Provided-Sinks) can be attached to save logs in parallel to some database for further analyses.

## Basic logging

This is an example of the usage of the logger in NBomber. The `ILogger` interface is exposed via context.

```csharp
var scenario = Scenario.Create("my-scenario", async context =>
{
    context.Logger.Debug("invocation number: {0}", context.InvocationNumber);
    return Response.Ok();
})
.WithInit(context =>
{    
    context.Logger.Information("MY INIT");
    return Task.CompletedTask;
})
.WithClean(context =>
{    
    context.Logger.Information("MY CLEAN");
    return Task.CompletedTask;
});
```

## Configuring Logger

By default Public Logger writes logs only to a text file using [Serilog.Sinks.File](https://github.com/serilog/serilog-sinks-file). The default output folder for the logs is NBomber's report folder. 

### Changing minimum log level

The minimum customization that you can do with the logger is to change the minimum log level. Setting a minimum log level allows you to control the amount of information that is recorded in the logs. For example, if you set the minimum log level to `INFO`, only log messages with a severity level of `INFO` or higher will be recorded, while `DEBUG` messages will be ignored. This can be useful for reducing the amount of noise in the logs and focusing on the most important information.

:::info
The default minimum log level is `DEBUG`.
:::

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithMinimumLogLevel(LogEventLevel.Debug)
    .Run();
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/HelloWorld/LoggerExample.cs).*

### Overriding the default file logger

Another option that NBomber supports is to provide a complete logger configuration. This option gives full control in configuring the logging pipeline. Using it, you can also set up [storing logs in databases](logger#storing-logs-in-databases). In addition, there is an option to use [JSON Infrastructure Config](json-config#json-infrastracture-config) and configure your logger via JSON.

<Tabs>
<TabItem value="C#" label="C#" default>

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithLoggerConfig(() => 
        new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.File(
                path: "my-log.txt",
                outputTemplate:
                "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] [ThreadId:{ThreadId}] {Message:lj}{NewLine}{Exception}",
                rollingInterval: RollingInterval.Day)
                // buffered: true)
    )
    .Run();
```

</TabItem>

<TabItem value="JSON" label="JSON">

```json title="infra-config.json"
{
  "Serilog": {
    "Using":  ["Serilog.Sinks.File"],
    "MinimumLevel": "Debug",
    "WriteTo": [{ 
      "Name": "File", 
      "Args": { 
        "path": "my-log.txt",
        "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}",         
        "rollingInterval": "Day" 
      }
    }]
  }
}
```

</TabItem>
</Tabs>

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/HelloWorld/LoggerExample.cs).*

## Storing logs in databases

By storing logs in databases, the users can easily search and analyze logs to identify issues, troubleshoot problems, and monitor system performance. Powerful full-text search capabilities enable users to quickly search and retrieve specific logs based on keywords, phrases, and other criteria. Storing logs in databases can also help collect logs from different nodes, especially when running NBomber in cluster mode.

### Elasticsearch

[Elasticsearch](https://www.elastic.co/) is a popular choice for indexing and searching logs due to its powerful search capabilities and scalability. Elasticsearch is designed to handle large amounts of unstructured data, such as logs, and can be used to quickly search and analyze logs for troubleshooting and monitoring purposes.

Serilog logger provides an [Elasticsearch sink](https://github.com/serilog/serilog-sinks-elasticsearch) that allows logging an application's events and errors to Elasticsearch. The Serilog Elasticsearch sink writes log events to Elasticsearch in a structured JSON format, making it easy to search, analyze, and visualize your logs using Elasticsearch and [Kibana](https://www.elastic.co/kibana/). The sink is highly configurable, allowing you to customize the index and document structure, as well as specify the Elasticsearch cluster and credentials.

Here's an example of how you can configure Serilog to use the Elasticsearch sink:

:::info
Installation prerequisites

You should have installed Elasticsearch database and Kibana. If you don't have it, you can use Docker Compose environment bootstrap by [following link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/Features/ElasticsearchLogger/docker-compose.yaml).
:::

#### Add Elasticsearch sink

First, we should add Serilog.Sinks.Elasticsearch since this package is not installed with NBomber.

```code
dotnet add package Serilog.Sinks.Elasticsearch
```

#### Configure Elasticsearch sink within NBomber

<Tabs>
<TabItem value="C#" label="C#" default>

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithLoggerConfig(() =>
        new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.Elasticsearch(nodeUris: "http://localhost:9200",
                                   indexFormat: "nbomber-{0:yyyy.MM.dd}")
                                   // batchPostingLimit: 50)
)
```

</TabItem>

<TabItem value="JSON" label="JSON">

```json title="infra-config.json"
{
  "Serilog": {
    "Using":  ["Serilog.Sinks.Elasticsearch"],
    "MinimumLevel": "Debug",
    "WriteTo": [{ 
      "Name": "Elasticsearch", 
      "Args": { 
        "nodeUris": "http://localhost:9200",
        "indexFormat": "nbomber-{0:yyyy.MM.dd}"        
      }
    }]
  }
}
```

</TabItem>
</Tabs>

In this example, we're configuring Serilog to write logs to Elasticsearch running on `http://localhost:9200`. We're also specifying that we want the log events to be written to an index with a format of `nbomber-yyyy.MM.dd`, where the `yyyy.MM.dd` part is replaced with the current date. We've also set the minimum log event level to Debug, so that all log events at or above the Debug level will be written to Elasticsearch.