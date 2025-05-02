---
id: system-requirements
title: NBomber system requirements
sidebar_position: 0
draft: true
---

## NBomber project settings

## Hardware considerations

## Scripting

NBomber tests can be run as dotnet scripts. Scripts could be used as for quick prototyping, for example covering specific HTTP endpoint, etc. For C# scripting we can use `dotnet-script` .NET tool.

### How to install dotnet-script
You can install dotnet-script as a global .NET tool:
```bash
dotnet tool install -g dotnet-script
```
Verify installation:
```bash
dotnet script --version
```

### Using dotnet-script with NBomber
You can use NBomber with ```dotnet-script``` to define and run performance tests without creating a full project.
- First, create a new .csx script file

```bash
touch loadtest.csx
```
- Add NBomber and other dependencies via NuGet Reference

```csharp
#r "nuget: NBomber, 6.0.2"
```
(You can replace 6.0.2 with the latest version if needed.)
- Write Your NBomber Script

Here's a basic example of a load test that just simulates a simple delay:
```csharp
#r "nuget: NBomber, 6.0.2"

using NBomber.CSharp;

var scenario = Scenario.Create("hello_world_scenario", async context =>
{
    // you can define and execute any logic here,
    // for example: send http request, SQL query etc
    // NBomber will measure how much time it takes to execute your logic
    await Task.Delay(500);

    return Response.Ok();
})
.WithoutWarmUp()
.WithLoadSimulations(
    Simulation.Inject(rate: 150, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(30))
);

NBomberRunner
    .RegisterScenarios(scenario)
    .Run();
```
- Run Your Script

To execute the script, simply run:
```bash
dotnet script loadtest.csx
```
