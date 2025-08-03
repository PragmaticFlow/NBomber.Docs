---
id: timeouts
title: Timeouts
sidebar_position: 10
---

On this page, you will learn about possible timeouts in NBomber.

## Scenario completion timeout
When NBomber finishes load tests, it waits for all running scenarios to complete their tasks. By default, Scenario completion timeout is 1 minute. This setting is globally applied for all scenarios.

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithScenarioCompletionTimeout(TimeSpan.FromMinutes(5))
    .Run();
```

You can also use [JSON configuration](json-config) to override this setting.

```json
{
    "GlobalSettings": {
        ...
    },

    // highlight-start
    "ScenarioCompletionTimeout": "00:05:00"
    // highlight-end
}
```

*You can find the complete example [by this link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/Timeouts/ScenarioCompletionTimeout.cs).*

## Operation cancellation after timeout

There might be situations where you need to cancel some operation after specified timeout. For this, you can use standard .NET [CancellationTokenSource](https://learn.microsoft.com/en-us/dotnet/api/system.threading.cancellationtokensource?view=net-8.0). 

**Example 1:**
```csharp
var scenario = Scenario.Create("scenario_with_timeout", async context =>
{
    using var timeout = new CancellationTokenSource();
    timeout.CancelAfter(600); // the operation will be canceled after 600 ms

    // here, we pass CancellationToken via timeout.Token
    // and because Task.Delay(1000) is bigger than 600 ms
    // the operation will be cancelled

    await Task.Delay(1000, timeout.Token);

    return Response.Ok(statusCode: "200", sizeBytes: 1000);
})
.WithoutWarmUp()
.WithLoadSimulations(
    Simulation.KeepConstant(copies: 50, during: TimeSpan.FromSeconds(30))
);
```

*You can find the complete example [by this link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/ScenarioWithTimeout.cs).*

The same approach can be applied to any other asynchronous operation.

**Example 2:** 

```csharp
var scenario = Scenario.Create("http_scenario", async context =>
{
    using var timeout = new CancellationTokenSource();
    timeout.CancelAfter(50); // the operation will be canceled after 50 ms

    var request =
        Http.CreateRequest("GET", "https://nbomber.com")
            .WithHeader("Content-Type", "application/json");
            //.WithBody(new StringContent("{ some JSON }", Encoding.UTF8, "application/json"));    

    var clientArgs = HttpClientArgs.Create(timeout.Token);

    var response = await Http.Send(httpClient, clientArgs, request);

    return response;
})
```

*You can find the complete example [by this link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/HttpWithTimeoutExample.cs).*