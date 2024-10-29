---
id: json-config
title: JSON Config
sidebar_position: 5
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

- Load configuration as JSON content.
```csharp
NBomberRunner
    .RegisterScenarios(scenario)    
    .LoadConfig("{ YOUR JSON CONFIG }")
    .Run();
```

- HTTP URL
```csharp
NBomberRunner
    .RegisterScenarios(scenario)    
    .LoadConfig("https://my-test-host.com/config.json")
    .Run();
```

- CLI argument "--config"
```bash
dotnet MyLoadTest.dll --config="config.json"
```

### Overriding settings via JSON

This is a complete JSON Config example that you can use to override the settings you wish. In addition to JSON Config, you will find a corresponding C#(on the C# tab) code example that shows all settings that JSON Config will override. **Also, consider how CustomSettings and GlobalCustomSettings will be passed and loaded inside the C# example**. 
- **CustomSettings** allows you to specify custom Scenario settings via JSON, which will be passed only to the corresponding Scenario (for which they are defined). These CustomSettings will be accessible through the ScenarioInit handler.
- **GlobalCustomSettings** allows you to specify custom settings via JSON which will be available globally across all defined scenarios. This is useful when some of your settings need to be accessible to all scenarios. These GlobalCustomSettings will be accessible through the ScenarioInit handler.

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
              { "RampingInject": [50, "00:00:01", "00:00:30"] },
              { "Inject": [50, "00:00:01", "00:01:00"] },
              { "RampingInject": [0, "00:00:01", "00:00:30"] }
          ],          

          // highlight-start
          "CustomSettings": {
              "MyTestField": "localhost",              
              "MyPauseMs": 100
          },
          // highlight-end

          "MaxFailCount": 500,

          "Weight": 10
      }
    ],

    // highlight-start
    "GlobalCustomSettings": {            
        "ConnectionString": "my_db_connection_string"
    },
    // highlight-end
    
    "ReportFileName": "custom_report_name",
    "ReportFolder": "./my_reports",
    "ReportFormats": ["Html", "Txt"],
    "ReportingInterval": "00:00:30",
    
    "DisplayConsoleMetrics": true
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

public class GlobalScenarioSettings
{
    public string ConnectionString { get; set; }
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
            // On Scenario Init, the corresponding CustomSettings defined in JSON Config
            // will be passed and loaded here.
            // highlight-start
            _customSettings = context.CustomSettings.Get<CustomScenarioSettings>();

            context.Logger.Information(
                "test init received CustomSettings.MyTestField '{0}'",
                _customSettings.MyTestField
            );
            // highlight-end

            // highlight-start
            // if you want some settings to be shared globally among all scenarios
            // you can use GlobalCustomSettings for this
            var globalSettings = context.GlobalCustomSettings.Get<GlobalScenarioSettings>();
            context.Logger.Information(
                "test init received GlobalSettings.ConnectionString '{0}'",
                globalSettings.ConnectionString
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
        .WithMaxFailCount(1_000)
        .WithWeight(10);

        NBomberRunner
            .RegisterScenarios(scenario)
            .LoadConfig("./Features/CustomSettings/config.json")
            .WithTestSuite("my test suite")
            .WithTestName("my test name")
            .WithReportFileName("my_report")
            .WithReportFolder("report_folder")
            .WithReportFormats(ReportFormat.Txt, ReportFormat.Html)
            .WithReportingInterval(TimeSpan.FromSeconds(10))
            .DisplayConsoleMetrics(true)            
            .Run();
    }
}
```

</TabItem>
</Tabs>

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/CustomSettings).*

### Overriding LoadSimulation in JSON Config

```json
"LoadSimulationsSettings": [              
    { "RampingInject": [50, "00:00:01", "00:00:30"] },
    { "Inject": [50, "00:00:01", "00:01:00"] }
    { "RampingInject": [0, "00:00:01", "00:00:30"] },
],  
```

On [this page](load-simulation#loadsimulation-in-json-config), you will find instructions on how to override LoadSimulation settings via the JSON configuration.

### Overriding Scenario Weight in JSON Config

```json
"ScenariosSettings": [
    {
        "ScenarioName": "test_youtube",
        "Weight": 10
    }
]
```

### Overriding Thresholds in JSON Config

```json
"ThresholdSettings": [
    { "OkRequest": "RPS >= 30" },
    { "OkRequest": "Percent > 90" }
]
```

On [this page](asserts_and_thresholds#runtime-thresholds-in-json-config), you will find instructions on how to override Thresholds settings via the JSON configuration.

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