---
id: influx-db
title: InfluxDB
sidebar_position: 0
---

Using [Reporting Sinks](../nbomber/reporting-sinks), you can store NBomber metrics in [InfluxDB](https://www.influxdata.com/) and analyze your performance results with [InfluxDB UI](https://docs.influxdata.com/influxdb/v2/visualize-data/) or [Grafana](https://grafana.com/).

:::info
To start working with [NBomber.Sinks.InfluxDB](https://www.nuget.org/packages/NBomber.Sinks.InfluxDB) package you should install it:

```code
dotnet add package NBomber.Sinks.InfluxDB
```

Also, the [source code is available on Github](https://github.com/PragmaticFlow/NBomber.Sinks.InfluxDB).
:::

## Integrating with InfluxDB

:::info
The simple way to run InfluxDB is via Docker. By this link, you can find a [docker-compose.yaml](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/RealtimeReporting/InfluxDB/docker-compose.yaml) to run it.

:::

```csharp
var influxDbSink = new InfluxDBSink(
    new InfluxDBClient("http://localhost:8086", "token")
);

var scenario = Scenario.Create("scenario", async context => { ... });

NBomberRunner
    .RegisterScenarios(scenario)    
    .WithReportingInterval(TimeSpan.FromSeconds(5))
    .WithReportingSinks(influxDbSink);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/RealtimeReporting/InfluxDB).*

### Configuring InfluxDB Sink via JSON Config

To configure InfluxDB Sink we will use [JSON Infrastracture Config](../nbomber/json-config#json-infrastracture-config) file

```json title="infra-config.json"
{
    "InfluxDBSink": {
      "Url": "http://localhost:8086",
      "Database": "nbomber",
      "UserName": "",
      "Password": "",
      "Token": "",
      "CustomTags": [{"Key": "environment", "Value": "linux"}]
    }
}
```

Now you should load this **"infra-config.json"** file.

```csharp
var influxDbSink = new InfluxDBSink();

var scenario = Scenario.Create("scenario", async context => { ... });

NBomberRunner
    .RegisterScenarios(scenario)    
    .WithReportingInterval(TimeSpan.FromSeconds(5))
    .WithReportingSinks(influxDbSink)
    .LoadInfraConfig("infra-config.json");
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/RealtimeReporting/InfluxDB).*

### Saving custom metrics to InfluxDB

There could be cases where you want to write your custom raw metrics to InfluxDB. Here is an example of how you can use InfluxDB sink to write your custom data.

```csharp
var influxDbSink = new InfluxDBSink();

var scenario = Scenario.Create("scenario", async context =>
{    
    var writeApi = influxDbSink.InfluxClient.GetWriteApiAsync();

    var point = PointData
        .Measurement("nbomber")
        .Field("my_custom_counter", 1);

    await writeApi.WritePointAsync(point);

    return Response.Ok();
});
```

*By following this link, you can get more info about [InfluxClient](https://github.com/influxdata/influxdb-client-csharp).*

### Working with InfluxDB v1 and v2

**For InfluxDB v1:**

```csharp
var influxDbSink = new InfluxDBSink(
    new InfluxDBClient("http://localhost:8086", "username", "password", "database")
);
```
Or via JSON config.

```json title="infra-config.json"
{
    "InfluxDBSink": {
      "Url": "http://localhost:8086",
      "Database": "database",
      "UserName": "username",
      "Password": "password",      
      "CustomTags": [{"Key": "environment", "Value": "linux"}]
    }
}
```

**For InfluxDB v2:**

```csharp
var influxDbSink = new InfluxDBSink(
    new InfluxDBClient("http://localhost:8086", "token")
);
```

Or via JSON config.

```json title="infra-config.json"
{
    "InfluxDBSink": {
      "Url": "http://localhost:8086",      
      "Token": "token",
      "CustomTags": [{"Key": "environment", "Value": "linux"}]
    }
}
```