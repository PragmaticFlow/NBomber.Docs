---
id: tags
title: Tags
sidebar_position: 7
---

Tags are key/value pairs (for example, `env=prod` or `team=payments`) that you attach to a test run or to a scenario. Use tags to label your results, so that you can filter and group them in reports, reporting sinks and dashboards.

NBomber supports two levels of tags:

| Level | How to set |
| ----- | ---------- |
| **Session (global) tags** | `NBomberRunner.WithTags`, [JSON Config](#tags-in-json-config), [CLI (`--tags`)](#tags-in-cli) |
| **Scenario tags** | `Scenario.WithTags`, [JSON Config](#tags-in-json-config) |

## Session (global) tags

Session tags describe the whole test run: the environment, the region, the build number, and so on.

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    // highlight-start
    .WithTags(("env", "prod"), ("region", "eu"))
    // highlight-end
    .Run();
```

## Scenario tags

Scenario tags describe one scenario: the team that owns it, the service under test, and so on.

```csharp
var scenario = Scenario.Create("payment_scenario", async context =>
{
    // ...
    return Response.Ok();
})
// highlight-start
.WithTags(("team", "payments"), ("service", "billing"));
// highlight-end
```

## Merge and validation rules

- `WithTags` takes one or more `(key, value)` tuples.
- If you call `WithTags` more than one time, NBomber merges the tags. For the same key, the last value is used.
- If the same key occurs more than one time in one call, the last value is used.
- Tag keys are case-sensitive: `env` and `Env` are two different tags.
- A tag key cannot be empty. If a key is empty, NBomber stops with a validation error.

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithTags(("env", "dev"), ("team", "payments"))
    .WithTags(("env", "prod"))
    .Run();

// session tags: env=prod, team=payments
```

### Session tags and Scenario tags

NBomber keeps the two levels separate. Scenario tags are not added to `TestInfo.Tags`, and session tags are not added to `ScenarioStats.Tags`. 

A common approach for [Reporting Sinks](reporting-sinks) is to merge the two levels. When a sink writes metrics, it adds the session tags and the scenario tags to each data point. Thus, the metrics in your metrics database have both levels of tags.

## Read tags at runtime

Inside a scenario, you can read both levels of tags from the scenario context:

```csharp
var scenario = Scenario.Create("payment_scenario", async context =>
{
    var sessionTags = context.TestInfo.Tags;      // env=prod, region=eu
    var scenarioTags = context.ScenarioInfo.Tags; // team=payments, service=billing

    return Response.Ok();
});
```

After the test run, the tags are in the final statistics:

```csharp
var result = NBomberRunner
    .RegisterScenarios(scenario)
    .WithTags(("env", "prod"))
    .Run();

var sessionTags = result.TestInfo.Tags;
var scenarioTags = result.ScenarioStats.Get("payment_scenario").Tags;
```

A custom [Reporting Sink](reporting-sinks#implementing-custom-reporting-sink) gets the session tags and scenario tags in the `Start` method. 

```csharp
public class CustomReportingSink : IReportingSink
{
    private IBaseContext _context;

    public Task Init(IBaseContext context, IConfiguration infraConfig)
    {
        _context = context;        
        return Task.CompletedTask;
    }

    public Task Start(SessionStartInfo sessionInfo)
    {
        // highlight-start
        var sessionTags = _context.TestInfo.Tags;
        // highlight-end

        foreach (var scenario in sessionInfo.Scenarios)
        {
            var scenarioName = scenario.ScenarioName;
            // highlight-start
            var scenarioTags = scenario.Tags;
            // highlight-end
        }
        return Task.CompletedTask;
    }

    // ...
}
```

## Tags in JSON Config

You can set session tags in the root `Tags` field, and scenario tags in `ScenariosSettings[].Tags`. For the same key, the tags from the [JSON Config](json-config) override the tags from code.

```json title="nbomber-config.json"
{
  // highlight-start
  "Tags": {
    "env": "stg",
    "region": "eu"
  },
  // highlight-end

  "GlobalSettings": {
    "ScenariosSettings": [
      {
        "ScenarioName": "payment_scenario",
        // highlight-start
        "Tags": {
          "team": "payments",
          "tier": "critical"
        }
        // highlight-end
      }
    ]
  }
}
```

## Tags in CLI

You can set session tags with the `--tags` [CLI argument](cli). Each tag has the `key=value` format.

```bash
dotnet MyLoadTest.dll --tags env=prod team=payments
```

- NBomber splits each tag on the first `=` character. Thus, the value can contain `=`, for example: `--tags url=http://host?a=b`.
- If a key occurs more than one time, the last value is used.
- If a tag does not have the `key=value` format, NBomber stops with an error.
- The `--tags` argument sets only session tags.

:::info
To use CLI arguments, pass them into the `NBomberRunner.Run(string[] args)` method.
:::

## Priority

If the same session tag key is set in more than one place, NBomber uses this priority (from low to high):

1. Code (`NBomberRunner.WithTags`)
2. JSON Config (`Tags`)
3. CLI (`--tags`)

For scenario tags, the JSON Config (`ScenariosSettings[].Tags`) overrides the code (`scenario.WithTags`).