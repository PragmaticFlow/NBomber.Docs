---
id: scenario
title: Scenario
sidebar_position: 0
---

import ScenarioImage from './img/scenario.jpg'; 
import ScenarioStatsImage from './img/scenario_stats.jpg'; 

<center><img src={ScenarioImage} width="70%" height="70%" /></center>

Scenario play the most crucial role in building load tests with NBomber. Scenario represents typical user behavior. In other words - it’s a workflow that virtual users will follow. Technically speaking, each Scenario instance works as a dedicated .NET Task.

## Scenario Create

This method should be used to create Scenario. 

```csharp
public static ScenarioProps Create(string name, Func<IScenarioContext, Task<IResponse>> run)
```

Imagine that you need to model a simple workflow where the user will do the following:

1. Login
2. Open home page
3. Logout

And this is how it can be modeled using the `Scenario.Create` method:

```csharp
var scenario = Scenario.Create("my e-commerce scenario", async context =>
{
    await Login();        
    await OpenHomePage();     
    await Logout();

    return Response.Ok();        
});
```

When you run this scenario, NBomber will measure the whole scenario execution.
At the end of execution, NBomber will printout the scenario's statistics result:

:::info
**Global Information** - displays statistics for the whole scenario execution. To get measurements for each action (Login, Logout, etc.) separately, you must wrap the important user action into a [**Step**](step). The Step helps you granulate your Scenario execution on parts and measure them separately.
:::

<center><img src={ScenarioStatsImage} width="80%" height="80%" /></center>

## Scenario Init

This method should be used to initialize Scenario and all its dependencies. You can use it to prepare your target system, populate the database, or read and apply the JSON configuration for your scenario. 

:::info
Scenario `init` will be invoked before `warm-up` and `bombing` phases. If Scenario `init` throws an exception, the NBomber load test will stop the execution.
:::

```csharp
public ScenarioProps WithInit(Func<IScenarioInitContext, Task> initFunc)
```

Example:

```csharp
var scenario = Scenario.Create("scenario_with_init", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithInit(context =>
{
    // You can do here any initialization logic: populate the database, etc.
    context.Logger.Information("MY INIT");
    return Task.CompletedTask;
});
```
*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/ScenarioWithInit.cs).*

One of the widespread use cases for scenario init is to fetch a global JWT token for the whole load test scenario.

```csharp
var myGlobalJWT = "";

var scenario = Scenario.Create("scenario_with_init", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithInit(async context =>
{
    using var client = new HttpClient();
    myGlobalJWT = await client.GetStringAsync("https://myhost/jwt");    
});
```

Another widespread use case is to get and apply CustomSettings for the Scenario from the JSON configuration file. *You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/CustomSettings).*

```csharp
var scenario = Scenario.Create("scenario_with_init", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithInit(context =>
{
    var customSettings = context.CustomSettings.Get<CustomScenarioSettings>();

    context.Logger.Information(
        "test init received CustomSettings.TestField '{TestField}'",
        customSettings.TestField
    );
});
```

## Scenario Clean

This method should be used to clean the scenario's resources after the test finishes. 

:::info
Scenario `clean` will be invoked after `warm-up` and `bombing` phases. If Scenario `clean` throws an exception, the NBomber logs it and continues execution.
:::

```csharp
public ScenarioProps WithClean(Func<IScenarioInitContext, Task> cleanFunc)
```

Example:

```csharp
var scenario = Scenario.Create("scenario_with_clean", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithClean(context =>
{
    // You can do here any cleaning logic: clearing the database, etc.
    context.Logger.Information("MY CLEAN");
    return Task.CompletedTask;
});
```
*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/ScenarioWithInit.cs).*

## Scenario Context

ScenarioContext represents the execution context of the currently running Scenario. It provides functionality to log particular events, get information about the test, thread id, scenario copy/instance number, etc. Also, it provides the option to stop all or particular scenarios manually. 

```csharp
interface IScenarioContext
{
    TestInfo TestInfo { get; }
    ScenarioInfo ScenarioInfo { get; }
    NodeInfo NodeInfo { get; }
    ILogger Logger { get; }
    int InvocationNumber { get; }
    Dictionary<string,obj> Data { get; }
    void StopScenario(string scenarioName, string reason);
    void StopCurrentTest(string reason);
}
```

Example:

```csharp
var scenario = Scenario.Create("hello_world_scenario", async context =>
{
    // we can log data
    context.Logger.Information("the current session id {0}", context.TestInfo.SessionId);

    if (context.InvocationNumber > 10)
    {
        context.Logger.Debug("the current Scenario copy was invoked more than 10 times");        
    }

    if (context.NodeInfo.CurrentOperation == OperationType.Bombing)
    {
        context.Logger.Debug("Bombing!!!");
    }
    else if (context.NodeInfo.CurrentOperation == OperationType.WarmUp)
    {
        context.Logger.Debug("Warm Up!!!");              
    }

    return Response.Ok();
});
```

Another popular usage of ScenarioContext is related to share data between steps that you can find by this link.

## Scenario WarmUp

This method sets duration of warm-up phase. By default warm-up duration is 30 seconds.

```csharp
public ScenarioProps WithWarmUpDuration(TimeSpan duration)
```

This method disables warm-up.

```csharp
public ScenarioProps WithoutWarmUp()
```

Example 1 (enable warm-up):

```csharp
var scenario = Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithWarmUpDuration(TimeSpan.FromMinutes(1));
```

Example 2 (disable warm-up):

```csharp
var scenario = Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithoutWarmUp();
```

## Scenario LoadSimulations

This method allows configuring the load simulations for the current Scenario. Load simulation allows configuring parallelism and workload profiles. *To get more info please follow this [link](load-simulation).* 

Default value is: `Simulation.KeepConstant(copies: 1, during: TimeSpan.FromMinutes(1))`

```csharp
public ScenarioProps WithLoadSimulations(params LoadSimulation[] loadSimulations)
```

Example:

```csharp
var scenario = Scenario.Create("hello_world_scenario", async context =>
{
    await Task.Delay(1_000);

    return Response.Ok();
})
.WithoutWarmUp()
.WithLoadSimulations(
    Simulation.RampingInject(rate: 50, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromMinutes(1)),
    Simulation.Inject(rate: 50, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromMinutes(1))    
);
```

## Scenario RestartIterationOnFail

This method allows enabling or disabling the reset of Scenario iteration in case of [Step](step) failure. The default value is true.

```csharp
public ScenarioProps WithRestartIterationOnFail(bool shouldRestart)
```

:::info
By default, when a Step returns a failed `Response` or unhandled exception was thrown, NBomber will automatically mark the whole iteration as failed and restart it. The configuration value of `RestartIterationOnFail` should be set to `false` to change this behavior and prevent auto restart of Scenario iteration.
:::

Sometimes, you would like to handle failed steps differently: retry, ignore or use a fallback. For such cases, you can disable scenario iteration restart.

Example: In this example, we will execute a `Step`, and when the response is finished with an error, we should retry it until it succeeds.

```csharp
var scenario = Scenario.Create("scenario", async context =>
{
    var counter = 0;

    var step1Response = Response.Fail<string>();

    while (step1Response.IsError)
    {
        step1Response = await Step.Run("step_1", context, async () =>
        {
            counter += 1;
            await Task.Delay(1000);

            return counter == 3
                ? Response.Ok(payload: "ok response")
                : Response.Fail<string>();
        });
    }

    return Response.Ok();
})
.WithRestartIterationOnFail(shouldRestart: false); // by default it's true
```

## Scenario MaxFailCount

This method overrides the default value of MaxFailCount for `Scenario`. By default the MaxFailCount = 5_000. MaxFailCount is incremented on every failure or failed Response. When a scenario reaches MaxFailCount, NBomber will stop the whole load test.

:::info
In the case of cluster mode, MaxFailCount is tracked per each NBomber instance exclusively. It doesn't aggregate across the cluster. So if on any NBomber node MaxFailCount is reached, NBomber will stop the whole load test.
:::

```csharp
public ScenarioProps WithMaxFailCount(int maxFailCount)
```

Usually, when a scenario gets too many errors, it does make sense to stop it earlier since continuing running produces more problems and often does not make much sense. Especially for this case, NBomber counts all scenario's failures, and if the counter reaches the `MaxFailCount`, NBomber will stop the test early.

Example:

```csharp
var scenario = Scenario.Create("scenario", async context =>
{
    await Task.Delay(1_000);
    return Response.Ok();
})
.WithMaxFailCount(10);
```

You can also use [JSON configuration](json-config) to override this setting.

```json
{
    "GlobalSettings": {
        
        "ScenariosSettings": [
            {
                "ScenarioName": "test_youtube",
                "WarmUpDuration": "00:00:02",                

                // highlight-start
                "MaxFailCount": 500
                // highlight-end
            }
        ]

    }
}
```

## Empty scenario

This method creates empty `Scenario`.

```csharp
public ScenarioProps Empty(string name)
```

An empty `Scenario` is useful when you want to create the scenario to do only initialization or cleaning and execute it separately. The need for this can be when you have a few scenarios with the same init logic, and you want to run this init logic only once. Instead of using workarounds, you can separate the init logic into the dedicated scenario.

Example:

```csharp
var initDbScn = 
  Scenario
      .Empty("populate_database_scenario")
      .WithInit(async context =>
      {
          // here we can populate our DB
          await Task.Delay(5000);
      })
      .WithClean(async context =>
      {
          // here we can do a cleanup for our DB
          await Task.Delay(5000);
      });
```

## Scenario Timeouts

### Scenario Completion Timeout
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