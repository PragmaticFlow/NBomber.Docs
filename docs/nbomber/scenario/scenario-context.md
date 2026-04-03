---
id: scenario-context
title: Scenario Context
sidebar_position: 3
---

ScenarioContext Represents the execution context of the currently running scenario in NBomber. It provides utilities to access test metadata, scenario-specific data, logging and controlling test execution: for example, stopping scenarios dynamically. 

```csharp
public interface IScenarioContext
{
    /// Gets metadata about the current test session (e.g., test suite, test name, session ID).
    TestInfo TestInfo { get; }

    /// Gets metadata about the scenario being executed (e.g., scenario name, duration, thread count).
    ScenarioInfo ScenarioInfo { get; }

    /// Gets information about the current NBomber node, including node type (Coordinator, Agent, or SingleNode).
    NodeInfo NodeInfo { get; }

    /// Provides a structured logger for writing scenario-specific log messages.
    ILogger Logger { get; }

    /// Represents the invocation number of the scenario.
    /// Starts at 1 and increments with each new invocation.
    long InvocationNumber { get; }

    /// The dictionary for storing data during a single scenario iteration.
    /// The data is cleared automatically after each iteration.
    /// Useful for sharing data between steps within the same scenario iteration.
    Dictionary<string, object> Data { get; }

    /// A dictionary for storing data across the entire lifecycle of the scenario instance.
    /// Useful for simulating virtual user state, user session data, etc.
    Dictionary<string, object> ScenarioInstanceData { get; }

    /// <summary>
    /// Provides a cancellation token that indicates if the scenario execution has been canceled or finished.
    /// You can observe <c>IsCancellationRequested</c> to react to cancellation requests.
    /// </summary>
    CancellationToken ScenarioCancellationToken { get; }

    /// <summary>
    /// Provides a .NET <see cref="System.Random"/> instance for introducing random behavior within scenarios.
    /// </summary>
    Random Random { get; }

    /// <summary>
    /// Stops the specified scenario by name.
    /// In cluster mode, the scenario will be stopped across all nodes.
    /// </summary>
    /// <param name="scenarioName">The name of the scenario to stop.</param>
    /// <param name="reason">A descriptive reason for stopping the scenario.</param>
    void StopScenario(string scenarioName, string reason);

    /// <summary>
    /// Stops all running scenarios and terminates the current test session.
    /// In cluster mode, this command is propagated to all nodes.
    /// </summary>
    /// <param name="reason">A descriptive reason for stopping the test.</param>
    void StopCurrentTest(string reason);

    /// <summary>
    /// Returns the elapsed time since the scenario timer started.
    /// Useful for time-based control or custom metrics.
    /// </summary>
    /// <returns>The current elapsed time as a <see cref="TimeSpan"/>.</returns>
    TimeSpan GetScenarioTimerTime();
}
```

## Examples

### TestInfo

Provides metadata about the current test session such as test suite name, test name, and session ID.

```csharp
var scenario = Scenario.Create("test_info_example", async context =>
{
    context.Logger.Information("Session: {0}", context.TestInfo.SessionId);
    context.Logger.Information("Test Suite: {0}", context.TestInfo.TestSuite);
    context.Logger.Information("Test Name: {0}", context.TestInfo.TestName);

    return Response.Ok();
});
```

### ScenarioInfo

Provides metadata about the scenario being executed, such as the scenario name, duration, and thread number.

```csharp
var scenario = Scenario.Create("scenario_info_example", async context =>
{
    context.Logger.Information("Scenario: {0}", context.ScenarioInfo.ScenarioName);
    context.Logger.Information("Instance Number: {0}", context.ScenarioInfo.InstanceNumber);
    context.Logger.Information("Duration: {0}", context.ScenarioInfo.Duration);

    return Response.Ok();
});
```

### NodeInfo

Provides information about the current NBomber node, including node type and current operation (WarmUp or Bombing).

```csharp
var scenario = Scenario.Create("node_info_example", async context =>
{
    if (context.NodeInfo.CurrentOperation == OperationType.Bombing)
    {
        context.Logger.Debug("Bombing!!!");
    }
    else if (context.NodeInfo.CurrentOperation == OperationType.WarmUp)
    {
        context.Logger.Debug("Warm Up!!!");
    }

    context.Logger.Information("Node Type: {0}", context.NodeInfo.NodeType);

    return Response.Ok();
});
```

### Logger

A structured logger (Serilog `ILogger`) for writing scenario-specific log messages.

```csharp
var scenario = Scenario.Create("logger_example", async context =>
{
    context.Logger.Information("Starting request for session {0}", context.TestInfo.SessionId);
    context.Logger.Debug("Debug details: invocation {0}", context.InvocationNumber);
    context.Logger.Warning("Response time exceeded threshold");

    return Response.Ok();
});
```

### InvocationNumber

Represents the invocation count of the scenario. Starts at 1 and increments with each new invocation.

```csharp
var scenario = Scenario.Create("invocation_example", async context =>
{
    if (context.InvocationNumber == 1)
    {
        context.Logger.Information("First invocation");
    }

    if (context.InvocationNumber > 100)
    {
        context.Logger.Debug("Scenario invoked more than 100 times");
    }

    return Response.Ok();
});
```

### Data

A dictionary for sharing data between steps within a single scenario iteration. Cleared automatically after each iteration.

```csharp
var scenario = Scenario.Create("data_example", async context =>
{
    var step1 = await Step.Run("create_user", context, async () =>
    {
        var userId = "user_123";
        context.Data["UserId"] = userId;
        return Response.Ok(payload: userId);
    });

    var step2 = await Step.Run("get_user", context, async () =>
    {
        var userId = (string)context.Data["UserId"];
        // use userId from previous step
        return Response.Ok();
    });

    return Response.Ok();
});
```

### ScenarioInstanceData

The dictionary for storing data across the entire lifecycle of a scenario instance. Useful for simulating virtual user state or session data.

```csharp
var scenario = Scenario.Create("instance_data_example", async context =>
{
    // Initialize auth token on first invocation
    if (!context.ScenarioInstanceData.ContainsKey("AuthToken"))
    {
        var token = "token_" + context.ScenarioInfo.ThreadNumber;
        context.ScenarioInstanceData["AuthToken"] = token;
        context.Logger.Information("Auth token initialized: {0}", token);
    }

    var authToken = (string)context.ScenarioInstanceData["AuthToken"];
    // use authToken for authenticated requests

    return Response.Ok();
});
```

### ScenarioCancellationToken

A cancellation token that signals when the scenario execution has been canceled or finished.

```csharp
var scenario = Scenario.Create("cancellation_example", async context =>
{
    using var httpClient = new HttpClient();
    var response = await httpClient.GetAsync(
        "https://api.example.com/data",
        context.ScenarioCancellationToken
    );

    if (context.ScenarioCancellationToken.IsCancellationRequested)
        return Response.Fail();

    return Response.Ok();
});
```

### Random

A `System.Random` instance for introducing random behavior within scenarios.

```csharp
var scenario = Scenario.Create("random_example", async context =>
{
    var delay = context.Random.Next(100, 500);
    await Task.Delay(delay);

    var endpoints = new[] { "/api/users", "/api/orders", "/api/products" };
    var endpoint = endpoints[context.Random.Next(endpoints.Length)];

    // make request to random endpoint
    return Response.Ok();
});
```

### StopScenario

Stops the specified scenario by name. In cluster mode, the scenario will be stopped across all nodes.

```csharp
var scenario = Scenario.Create("stop_scenario_example", async context =>
{
    var response = await httpClient.GetAsync("https://api.example.com/health");

    if (!response.IsSuccessStatusCode)
    {
        context.StopScenario("stop_scenario_example", "API health check failed");
    }

    return Response.Ok();
});
```

### StopCurrentTest

Stops all running scenarios and terminates the current test session. In cluster mode, this is propagated to all nodes.

```csharp
var scenario = Scenario.Create("stop_test_example", async context =>
{
    try
    {
        var response = await httpClient.GetAsync("https://api.example.com/data");
        return Response.Ok();
    }
    catch (Exception ex)
    {
        context.Logger.Error(ex, "Critical failure");
        context.StopCurrentTest("Critical failure — stopping all scenarios");
        return Response.Fail();
    }
});
```

### GetScenarioTimerTime

Returns the elapsed time since the scenario timer started. Useful for time-based control or custom metrics.

```csharp
var scenario = Scenario.Create("timer_example", async context =>
{
    var elapsed = context.GetScenarioTimerTime();

    if (elapsed > TimeSpan.FromMinutes(5))
    {
        context.Logger.Information("Test running for over 5 minutes, elapsed: {0}", elapsed);
    }

    return Response.Ok();
});
```