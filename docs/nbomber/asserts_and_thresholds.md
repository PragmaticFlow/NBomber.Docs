---
id: asserts_and_thresholds
title: Asserts and Thresholds
sidebar_position: 3
---

import ThresholdsImage from './img/thresholds.jpg';
import RuntimeThresholdsImage from './img/runtime_thresholds.jpg';

<center><img src={ThresholdsImage} width="60%" height="60%" /></center>

## Thresholds

Thresholds are the pass/fail criteria that you define for your load test. NBomber provides detailed stats that should be used to define thresholds. For example, you can create thresholds for any combination of the following expectations:

- 75% of requests have a response time below 200ms.
- 99% of requests have a response time below 400ms.
- Less than 1% of requests return an error.
- Less than 5% error responses with status code 503.
- A specific endpoint always responds within 300ms.
- A specific endpoint always returns less than 30KB.
- A whole scenario should transfer no more than 1GB of traffic.

:::info
NBomber supports the `Percent` property, which helps define thresholds related to percent.

```csharp
stats.Ok.Request.Percent == 80   // success rate = 80%
stats.Fail.Request.Percent == 20 // error rate = 20%

stats.Ok.StatusCodes.Get("200").Percent >= 50)   // 50% requests with status code 200
stats.Fail.StatusCodes.Get("500").Percent == 25) // 25% requests with status code 500
stats.Fail.StatusCodes.Get("501").Percent == 25) // 25% requests with status code 501

stats.Ok.Latency.Percent99 < 400; // 99% of requests below 400ms.
stats.Ok.Latency.Percent95 < 400; // 95% of requests below 400ms.
stats.Ok.Latency.Percent75 < 400; // 75% of requests below 400ms.
stats.Ok.Latency.Percent50 < 400; // 50% of requests below 400ms.
```
:::

Example: In this example, we have a basic load test that will be covered by assertions. We will go into more detail on assertions later.

```csharp
[Fact]
public void RunLoadTest()
{
    var scenario = Scenario.Create("http-scenario", async context =>
    {
        var login = Step.Run("login", ...);
        var logout = Step.Run("logout", ...);
                
        return Response.Ok();
    });

    var result = NBomberRunner
                    .RegisterScenarios(scenario)
                    .Run();

    var scnStats = result.ScenarioStats.Get("http-scenario");
    var loginStats = scnStats.StepStats.Get("login");

    // scenario thresholds with assertions
    Assert.True(scnStats.Ok.Request.RPS > 100);       // request per second > 100
    Assert.True(scnStats.Ok.Latency.Percent75 < 200); // 75% of requests below 200ms.
    Assert.True(scnStats.Ok.Latency.Percent99 < 400); // 99% of requests below 400ms.

    Assert.True(scnStats.Fail.Request.Percent < 1);   // less than 1% of errors

    // less than 5% error responses with status code 503
    Assert.True(
        scenarioStats.Fail.StatusCodes.Exists("503")
        && scenarioStats.Fail.StatusCodes.Get("503").Percent < 5 
    );

    // a specific endpoint always responds within 300ms.
    Assert.True(loginStats.Ok.Latency.Percent99 < 300);
    Assert.True(loginStats.Ok.Latency.MaxMs < 300);

    // a specific endpoint always returns less than 30KB.
    Assert.True(loginStats.Ok.DataTransfer.MeanBytes < 30_000);

    // a whole scenario should transfer no more than 1GB of traffic 
    Assert.True(loginStats.Ok.DataTransfer.AllBytes < 1GB);
}
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/xUnitExample/LoadTestExample.cs).*

## Assertions

Assertions are a way to check a result produced by running load tests. Failed assertions cause the test to abort or finish with a failed status. For the assertions we can use any popular .NET unit testing tool: [xUnit](https://xunit.net/) or [NUnit](https://nunit.org/). The simplest way to start is to create a test project in your IDE (Visual Studio, VS Code, or Rider). The alternative is to create a class library project and add relevant packages.

:::info
To install xUnit package along with the test executor, you should execute the following dotnet command:

[![NuGet](https://img.shields.io/nuget/v/xunit.svg)](https://www.nuget.org/packages/xunit/)
[![Nuget](https://img.shields.io/nuget/dt/xunit.svg)](https://www.nuget.org/packages/xunit/)

```code
dotnet add package xunit
dotnet add package xunit.runner.visualstudio
dotnet add package Microsoft.NET.Test.Sdk
```
::: 

Example:

```csharp
Assert.True(stepStats.Ok.Latency.Percent99 > 0);
Assert.False(stepStats.Ok.Latency.Percent99 > 1_000);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/xUnitExample/LoadTestExample.cs).*

## Runtime Thresholds

Typically, thresholds with assertions are applied after the active load test finished, when all the available statistics are provided. Here is an example:

```csharp
var scenario = Scenario.Create("http-scenario", async context => ...);

var result = NBomberRunner
    .RegisterScenarios(scenario)
    .Run();

// the test is finished, and we can now retrieve the final stats to check against our thresholds.
var scnStats = result.ScenarioStats.Get("http-scenario");

Assert.True(scnStats.Fail.Request.Percent <= 5);  
```

However, there may be cases where you want to define thresholds that are active throughout the entire test run — we refer to these as **Runtime Thresholds**. Here is an example:

```csharp
var scenario = Scenario.Create("http_scenario", async context =>
{
    ...
})
.WithThresholds(  
    Threshold.Create(scenarioStats => scenarioStats.Fail.Request.Percent < 10)
    Threshold.Create("step_1", stepStats => stepStats.Fail.Request.Percent < 10),
)
```

:::info
**Runtime Thresholds**, applied to real-time stats, help prevent the test from continuing execution if specific failure criteria are already met. Additionally, the results of these threshold checks are included in the HTML report, making them highly useful for performance analysis. 

- By default, Runtime Thresholds are configured to run without causing early termination of the test. However, you can flexibly control the failure criteria (*abortWhenErrorCount*), after which the test will be terminated early.

```csharp
Threshold.Create(scenarioStats => 
    scenarioStats.Fail.Request.Percent < 10, 
    // highlight-start
    abortWhenErrorCount: 5
    // highlight-end
)
```

- There may be cases where you want to delay the start of the threshold check. For instance, you might want to skip threshold checks during the load test's ramp-up phase, allowing the system to stabilize before performance metrics are evaluated.

```csharp
Threshold.Create(scenarioStats => 
    scenarioStats.Fail.Request.Percent < 10, 
    // highlight-start
    startCheckAfter: TimeSpan.FromSeconds(10) // Threshold check will be delayed on 10 sec
    // highlight-end
)
```

- Runtime Thresholds perform checks periodically, by default every 5 seconds.
- Runtime Thresholds can be defined in [JSON Config](#runtime-thresholds-in-json-config).
:::

After completing a test that includes Runtime Thresholds, the results of the threshold checks will be available in the HTML report. This allows you to easily review and analyze how the system performed against the defined thresholds throughout the test run.

<center><img src={RuntimeThresholdsImage} /></center>

### Runtime Thresholds in Code

In this example, we will define Runtime Thresholds for `"http_scenario"` using code. Afterward, we'll explore how to achieve the same result in a more dynamic way through a JSON configuration.

```csharp
[Fact]
public void Runtime_Thresholds_Example()
{
    var scenario = Scenario.Create("http_scenario", async context =>
    {
        ...
    })
    .WithoutWarmUp()
    .WithLoadSimulations(Simulation.Inject(rate: 1, interval: TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(50)))
    .WithThresholds(
        
        // Threshold for Scenario that checks: error rate < 10%
        Threshold.Create(scenarioStats => scenarioStats.Fail.Request.Percent < 10),

        // Threshold for Step that checks: error rate < 10%
        Threshold.Create("step_1", stepStats => stepStats.Fail.Request.Percent < 10),

        // Threshold for Scenario that checks if any response contains status code 404
        Threshold.Create(
            scenarioStats => scenarioStats.Fail.StatusCodes.Exists("404"),
            
            abortWhenErrorCount: 5, // Threshold checks are executed based on the ReportingInterval (by default each 5 sec),
                                    // so when the threshold ErrorCount = 5, the load test will be aborted.
                                    // By default, 'abortWhenErrorCount' is null meaning Thresholds errors will not abort the test execution.
            
            startCheckAfter: TimeSpan.FromSeconds(10) // Threshold check will be delayed on 10 sec
        ),

        // Threshold for Scenario that checks if status code 200 is present and if Percent => 80%
        Threshold.Create(scenarioStats => scenarioStats.Ok.StatusCodes.Find("200")?.Percent >= 80)
    );

    var result = NBomberRunner
        .RegisterScenarios(scenario)
        .Run();

    // Here, we attempt to find a failed threshold, and if one is found, we throw an exception.
    var failedThreshold = result.Thresholds.FirstOrDefault(x => x.IsFailed);

    Assert.True(failedThreshold == null);
}
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/xUnitExample/Thresholds.cs).*

### Runtime Thresholds in JSON Config

[JSON Config](json-config.md) allows you to configure basic load test settings using JSON. One such setting is `ThresholdSetting`, which enables you to configure the most commonly used threshold checks.

```json
{
    "GlobalSettings": {
        "ScenariosSettings": [
        {
            "ScenarioName": "http_scenario",
                
            "ThresholdSettings": [

                { "OkRequest": "RPS >= 80" },
                { "OkRequest": "Percent > 90" },

                { "FailRequest": "Percent < 10" },

                { "OkLatency": "max < 100" },
                { "StepName": "step_1", "OkLatency": "p75 < 80" },

                { "OkDataTransfer": "p75 < 80" },

                { "StatusCode": ["500", "Percent < 5"] },
                { "StatusCode": ["400", "Percent < 10"], "AbortWhenErrorCount": 5 },
                { "StatusCode": ["200", "Percent >= 80"], "AbortWhenErrorCount": 5, "StartCheckAfter": "00:00:10" }
    
            ]
        }
    }
}
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/xUnitExample/Configs/nbomber-config.json).*

### ThresholdSetting syntax for JSON Config

List of ThresholdSetting examples:

```json
{ "OkLatency": "max < 100" },
{ "OkLatency": "p75 < 80" },
{ "StepName": "step_1", "OkLatency": "p75 < 80", "AbortWhenErrorCount": 42 },
{ "StepName": "step_1", "OkLatency": "p75 < 80", "StartCheckAfter": "00:00:20" },
```

Simplified defination of ThresholdSetting contract:

```fsharp
type ThresholdSetting = {
    StepName: string option
    OkLatency: string    
    AbortWhenErrorCount: int option
    StartCheckAfter: TimeSpan option
}
```

The interesting thing for us is `OkLatency: string` which contains Threshold body. Let's see Threshold body format structure to understand what you can express with it:

```
ThresholdBody = <ThresholdType> <MetricType> <CheckExpression>
```

```json
// ThresholdType  MetricType  CheckExpression
{ "OkLatency":    "max        < 100" }
```

List of supported ThresholdType(s):

```fsharp
type ThresholdType = 
    | OkRequest      // equivalent to `stats.Ok.Request`
    | FailRequest    // equivalent to `stats.Fail.Request`
    | OkLatency      // equivalent to `stats.Ok.Latency`
    | OkDataTransfer // equivalent to `stats.Ok.DataTransfer` 
    | StatusCode     // equivalent to `stats.Ok.StatusCode` and `stats.Fail.StatusCode`
```

List of supported Metric(s):

```fsharp
type MetricType = 
    RPS | Percent | Min | Mean | Max | P50 | P75 | P95 | P99
```

Examples:
```json
"ThresholdSettings": [
    
    { "OkRequest": "RPS > 30" },     // RPS should be > 30
    { "OkRequest": "Percent > 90" }, // ok rate > 90%        

    { "FailRequest": "Percent < 20" },
    { "FailRequest": "RPS < 20" },    

    { "OkLatency": "max < 100" },
    { "StepName": "step_1", "OkLatency": "p75 < 80" },

    { "OkDataTransfer": "p75 < 80" },

    { "StatusCode": ["500", "Percent < 5"] },
    { "StatusCode": ["400", "Percent < 10"], "AbortWhenErrorCount": 5 },
    { "StatusCode": ["200", "Percent >= 50"], "AbortWhenErrorCount": 5, "StartCheckAfter": "00:00:10" }

]
```

## Stats Extensions API

The Stats Extensions include the useful helper methods: `Get, Find, Exists`, which are used to work with `ScenarioStats, StepStats, StatusCodes`, and other similar data.

```csharp
var result = NBomberRunner
                .RegisterScenarios(scenario1, scenario2)
                .Run();

// gets scenario stats: 
// it throws exception if "scenario_1" is not found 
var scnStats1 = result.ScenarioStats.Get("scenario_1");

// finds scenario stats: 
// it returns null if "scenario_2" is not found 
var scnStats2 = result.ScenarioStats.Find("scenario_2");

// check that step "login" exist in the list
bool isLoginExist = scnStats1.StepStats.Exists("login");

// gets "login" step stats
// it throws exception if "login" is not found 
var loginStats = scnStats1.StepStats.Get("login");

// check that status code "503" exist in the list
bool isExist = scnStats1.Fail.StatusCodes.Exists("503");

// get stats of status code "503"
// in case of status not found, the exception will be thrown
var statusCode = scnStats1.Fail.StatusCodes.Get("503");
```

*The defination of all (ScenarioStats, StepStats, StatusCodeStats, etc) stats types you can find by [this link](https://github.com/PragmaticFlow/NBomber.Contracts/blob/dev/src/NBomber.Contracts/Stats.fs#L126).*

## Bytes Extensions API

To work with bytes and be able to convert them to KB, MB, GB, NBomber provides a module `Bytes`.

```csharp
Bytes.FromKb(long kilobytes) // from Kb to bytes
Bytes.FromMb(long megabytes) // from MB to bytes
Bytes.FromGb(long gigabytes) // from GB to bytes

Bytes.ToKb(long bytes) // bytes to Kb
Bytes.ToMb(long bytes) // bytes to MB
Bytes.ToGb(long bytes) // bytes to GB
```

You can use these helper functions to define thresholds.

```csharp
// all data transfers should be bigger than 10GB
Assert.True(stats.Ok.DataTransfer.AllBytes > Bytes.FromGb(10));
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/xUnitExample/LoadTestExample.cs#L85).*