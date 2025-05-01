---
id: running_tests
title: Running tests
sidebar_position: 1
draft: true
---

## NBomber project settings
## Hardware considerations
## Scripting

Scripting refers to writing small programs to automate tasks, prototype ideas, or execute code without compiling a full application. Unlike traditional application development, scripting:
- Runs without a project or solution file
- Is typically interpreted or run directly via a script runner
- Is useful for automation, quick testing, and rapid prototyping

Examples of scripting languages include PowerShell, Python, Bash, and in the .NET world — C# scripting with dotnet-script.

### Why use dotnet-script
```dotnet-script``` is a tool that enables you to write and run C# scripts (.csx files) using the .NET SDK.

Benefits:
- No need for full-blown .csproj files or solutions
- Quick startup and faster iteration
- Supports NuGet packages
- Great for one-off utilities, automation tasks, or experiments

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
