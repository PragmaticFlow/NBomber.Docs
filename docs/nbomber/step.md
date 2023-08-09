---
id: step
title: Step
sidebar_position: 1
---

import StepAndScenarioImage from './img/step_and_scenario.jpg';
import StepsStatsImage from './img/steps_stats.jpg'; 

<center><img src={StepAndScenarioImage} width="70%" height="70%" /></center>

Step represents a single user action like login, logout, etc. Step helps you granulate your [Scenario](scenario) execution on parts and measure them separately. In case you don't need to split your Scenario on parts you can use just Scenario without any Step.

## Step Run

This method should be used to run Step.

```csharp
public static Task<Response<T>> Run(string name, IScenarioContext context, Func<Task<Response<'T>>> run)
```

Imagine that you need to model a simple workflow where the user will do the following:

1. Login
2. Open home page
3. Logout

```csharp
var scenario = Scenario.Create("my e-commerce scenario", async context =>
{
    var step1 = await Step.Run("login", context, async () =>
    {
        await Task.Delay(1_000);
        return Response.Ok();
    });

    var step2 = await Step.Run("open_home_page", context, async () =>
    {
        await Task.Delay(1_000);
        return Response.Ok();
    });    

    var step3 = await Step.Run("logout", context, async () =>
    {
        await Task.Delay(1_000);
        return Response.Ok();
    });

    return Response.Ok();        
});
```

When you run this scenario, NBomber will measure the whole scenario execution, including all steps.
At the end of execution, NBomber will printout the scenario's statistics result:

:::info
**Global Information** - displays statistics for the whole scenario execution. 
:::

<center><img src={StepsStatsImage} width="70%" height="70%" /></center>

## Using ScenarioContext inside Step

[ScenarioContext](scenario#scenario-context) is very useful abstraction that can be used inside `Step`.

```csharp
var scenario = Scenario.Create("scenario", async context =>
{
    var step1 = await Step.Run("login", context, async () =>
    {
        await Task.Delay(1_000);

        // we can log data
        context.Logger.Information("the current session id {0}", context.TestInfo.SessionId);

        if (context.InvocationNumber > 10)
        {
            context.Logger.Debug("the current Scenario copy was invoked more than 10 times");        
        }

        if (context.InvocationNumber > 100)
        {
            context.StopCurrentTest(reason: "no reason");        
        }

        return Response.Ok();
    });    

    return Response.Ok();
});
```

## Sharing data between steps

To share data between steps NBomber provides 3 options:

### 1. Sharing data via Response type

```csharp
var scenario = Scenario.Create("scenario", async context =>
{
    var step1 = await Step.Run("step_1", context, async () =>
    {
        await Task.Delay(1000);

        // OPTION 1
        // we can share data between steps via Response type

        return Response.Ok(payload: "step_1 response", sizeBytes: 10);
    });

    // now we can get data from step1
    if (step1.Payload.IsSome())
    {
        var step1Response = step1.Payload.Value;
        context.Logger.Information(step1Response);
    }

    return Response.Ok();
});
```

### 2. Sharing data via ScenarioContext.Data

```csharp
var scenario = Scenario.Create("scenario", async context =>
{
    var step2 = await Step.Run("step_2", context, async () =>
    {
        await Task.Delay(1000);

        // OPTION 2
        // we can share data between steps via context.Data dictionary
        context.Data["item_1"] = "txt";
        context.Data["item_2"] = 2;

        return Response.Ok();
    });

    context.Logger.Information(context.Data["item_1"].ToString());
    context.Logger.Information(context.Data["item_2"].ToString());

    return Response.Ok();
});
```

### 3. Sharing data via variables (closure)

```csharp
var scenario = Scenario.Create("scenario", async context =>
{
    // OPTION 3
    // we can share data between steps via regular variables (closure)

    var myData = "";

    var step3 = await Step.Run("step_3", context, async () =>
    {
        await Task.Delay(1000);

        myData = "data from step 3";

        return Response.Ok();
    });

    context.Logger.Information(myData);

    return Response.Ok();
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/CSharpProd/HelloWorld/StepsShareData.cs).*

## Step and retry logic

In the cloud, transient faults aren't uncommon and an application should be designed to handle them elegantly and transparently. It's a common practice to use retry logic to handle failed requests. NBomber provides a simple option to implement retry logic for Step, the [RestartIterationOnFail](scenario#scenario-restartiterationonfail) should be used.

<!-- ### Step and reordering -->

