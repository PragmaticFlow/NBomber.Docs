---
id: json-config
title: JSON Config
sidebar_position: 3
---

import JsonConfigImage from './img/json-config.jpg'; 

<center><img src={JsonConfigImage} width="80%" height="80%" /></center>

NBomber configuration system provides a way to configure NBomber load tests via JSON files. It's quite helpful when you want to run NBomber tests under different environments or workload profiles. NBomber supports two types of JSON config:

- [JSON Config](json-config#json-config) - This configuration allows the overriding of all settings related to scenario execution.
- [JSON Infrastracture Config](json-config#json-infrastracture-config) - This configuration allows the overriding settings related only to infrastructure: ReportingSink and WorkerPlugin.

:::info
JSON Config file has higher priority over code configuration. For example, if you specified [WarmUpDuration](scenario#scenario-warmup) in both: code and the config file, NBomber will take the value from the config file.
:::

### JSON Config

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

This is a complete JSON Config example that you can use to override the settings you wish.

```json title="config.json"
{
  "TestSuite": "gitter.io",
  "TestName": "test http api",

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

          "CustomSettings": {
              "MyTestField": "localhost",              
              "MyPauseMs": 100
          },

          "MaxFailCount": 500
      }
    ],
    
    "ReportFileName": "custom_report_name",
    "ReportFolder": "./my_reports",
    "ReportFormats": ["Html", "Txt"],
    "ReportingInterval": "00:00:30",
    "EnableHintsAnalyzer": false
  }
}

```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/Features/CustomSettings/config.json).*

### JSON Infrastracture Config

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

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/Features/RealtimeReporting/InfluxDB/infra-config.json).*