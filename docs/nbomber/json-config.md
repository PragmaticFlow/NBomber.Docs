---
id: json-config
title: JSON Config
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import JsonConfigImage from './img/json-config.jpg'; 

<center><img src={JsonConfigImage} width="80%" height="80%" /></center>

NBomber configuration system provides a way to configure NBomber load tests via JSON files. It's quite helpful when you want to run NBomber tests under different environments or workload profiles. NBomber supports two types of JSON config:

- [JSON Config](json-config#json-config) - This configuration file is used to override some of the Scenario settings related to execution. For example: LoadSimulations, WarmUpDuration, TargetScenarios, etc.
- [JSON Infrastracture Config](json-config#json-infrastracture-config) - This configuration file allows the overriding settings related only to infrastructure: Logger(s), ReportingSink(s) and WorkerPlugin(s).

## JSON Config

JSON Config file is used to override some of the Scenario settings.

:::info
JSON Config file has higher priority over code configuration. For example, if you specified [WarmUpDuration](scenario#scenario-warmup) in both: code and the config file, NBomber will take the value from the config file.
:::

To load JSON Config, you can use:

- Local file path to your JSON Config.
```csharp
NBomberRunner
    .RegisterScenarios(scenario)    
    .LoadConfig("config.json")
    .Run();
```

- HTTP URL
```csharp
NBomberRunner
    .RegisterScenarios(scenario)    
    .LoadConfig("https://my-test-host.com/config.json")
    .Run();
```

- CLI argument "--config" or "-c"
```bash
MyLoadTest.dll --config="config.json"
```

## Scenario custom settings

This is a complete JSON Config example that you can use to override the settings you wish. In addition to JSON Config, you will find a corresponding C#(on the C# tab) code example that shows all settings that JSON Config will override. **Also, consider how CustomSettings will be passed and loaded inside the C# example.**

<Tabs>
<TabItem value="JSON" label="JSON" default>

```json title="config.json"
{
  "TestSuite": "gitter.io",
  "TestName": "test_http_api",

  "TargetScenarios": ["test_youtube"],

  "GlobalSettings": {    
    
    "ScenariosSettings": [
      {
          "ScenarioName": "test_youtube",
          "WarmUpDuration": "00:00:02",

          "LoadSimulationsSettings": [
              { "RampingConstant": [2, "00:00:02"] },
              { "KeepConstant": [2, "00:00:02"] },
              { "RampingInject": [2, "00:00:01", "00:00:02"] },
              { "Inject": [2, "00:00:01", "00:00:02"] }
          ],          

          // highlight-start
          "CustomSettings": {
              "MyTestField": "localhost",              
              "MyPauseMs": 100
          },
          // highlight-end

          "MaxFailCount": 500
      }
    ],
    
    "ReportFileName": "custom_report_name",
    "ReportFolder": "./my_reports",
    "ReportFormats": ["Html", "Txt"],
    "ReportingInterval": "00:00:30"
  }
}

```

</TabItem>

<TabItem value="C#" label="C#">

```csharp
public class CustomScenarioSettings
{
    public string MyTestField { get; set; }
    public int MyPauseMs { get; set; }
}

public class JSONConfigExample
{
    CustomScenarioSettings _customSettings = new();

    public void Run()
    {
        var scenario = Scenario.Create("my_scenario", async context =>
        {
            var step = await Step.Run("step", context, async () =>
            {
                await Task.Delay(_customSettings.MyPauseMs);
                
                context.Logger.Debug(
                    "step received CustomSettings.MyTestField '{0}'",
                    _customSettings.MyTestField
                );
                
                return Response.Ok();
            });

            return Response.Ok();
        })
        .WithInit(context => 
        {      
            // On Scenario Init, the CustomScenarioSettings defined in JSON Config
            // will be passed and loaded here.
            // highlight-start
            _customSettings = context.CustomSettings.Get<CustomScenarioSettings>();

            context.Logger.Information(
                "test init received CustomSettings.MyTestField '{0}'",
                _customSettings.MyTestField
            );
            // highlight-end

            return Task.CompletedTask;
        })
        .WithLoadSimulations(
            Simulation.Inject(rate: 50,
                              interval: TimeSpan.FromSeconds(1),
                              during: TimeSpan.FromMinutes(1))
        )
        .WithWarmUpDuration(TimeSpan.FromSeconds(10))
        .WithMaxFailCount(1_000);

        NBomberRunner
            .RegisterScenarios(scenario)
            .LoadConfig("./Features/CustomSettings/config.json")
            .WithTestSuite("my test suite")
            .WithTestName("my test name")
            .WithReportFileName("my_report")
            .WithReportFolder("report_folder")
            .WithReportFormats(ReportFormat.Txt, ReportFormat.Html)
            .WithReportingInterval(TimeSpan.FromSeconds(10))            
            .Run();
    }
}
```

</TabItem>
</Tabs>

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/CustomSettings/config.json).*

## JSON Infrastracture Config

This configuration file allows the overriding settings related only to infrastructure: Logger(s), ReportingSink(s) and WorkerPlugin(s).

:::info
JSON Infrastracture Config file has higher priority over code configuration.
:::

To load JSON Infrastracture Config, you can use:

- Local file path to your JSON Infrastracture Config.
```csharp
NBomberRunner
    .RegisterScenarios(scenario)    
    .LoadInfraConfig("infra-config.json")
    .Run();
```

- HTTP URL
```csharp
NBomberRunner
    .RegisterScenarios(scenario)    
    .LoadInfraConfig("https://my-test-host.com/infra-config.json")
    .Run();
```

- CLI argument "--infra" or "-i"
```bash
MyLoadTest.dll --infra="infra-config.json"
```

This is an example of JSON Infrastracture Config.

```json title="infra-config.json"
{
    "Serilog": {
        "WriteTo": [{
            "Name": "Elasticsearch",
            "Args": {
                "nodeUris": "http://localhost:9200",
                "indexFormat": "nbomber-index-{0:yyyy.MM}"
            }
        }]
    },

    "PingPlugin": {
        "Hosts": ["jsonplaceholder.typicode.com"],
        "BufferSizeBytes": 32,
        "Ttl": 128,
        "DontFragment": false,
        "Timeout": 1000
    },
    
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

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/RealtimeReporting/InfluxDB/infra-config.json).*