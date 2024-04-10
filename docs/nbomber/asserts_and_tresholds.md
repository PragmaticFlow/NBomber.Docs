---
id: asserts_and_tresholds
title: Asserts and Thresholds
sidebar_position: 3
---

import ThresholdsImage from './img/thresholds.jpg';

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

Example: In this example, we have a simple load test that we will cover by asserts. Later on, we will discuss assertions in more detail.

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

    // scenario tresholds
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

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/xUnitExample).*

## Scenario Stats API

NBomber provides extension methods to work with final stats.

```csharp
var result = NBomberRunner
                .RegisterScenarios(scenario1, scenario2)
                .Run();

// get scenario stats
var scnStats1 = result.ScenarioStats.Get("scenario_1");
var scnStats2 = result.ScenarioStats.Get("scenario_2");

// check that step "login" exist in the list
bool isLoginExist = scnStats1.StepStats.Exists("login");
// get "login" step stats
var loginStats = scnStats1.StepStats.Get("login");

// check that status code "503" exist in the list
bool isExist = scnStats1.Fail.StatusCodes.Exists("503");
// get stats of status code "503"
// in case of status not found, the exception will be thrown
var statusCode = scnStats1.Fail.StatusCodes.Get("503");
```

*The defination of all (ScenarioStats, StepStats, StatusCodeStats, etc) stats types you can find by [this link](https://github.com/PragmaticFlow/NBomber.Contracts/blob/dev/src/NBomber.Contracts/Stats.fs#L126).*

## Bytes API

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