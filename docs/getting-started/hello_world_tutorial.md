---
id: hello_world_tutorial
title: Hello World Tutorial
sidebar_position: 2
---

This documentation will help you go from a total beginner to a seasoned NBomber expert!

Follow along to learn how to:
- Create and Run a test.
- Create HTTP load test.
- Ramp the number of requests up and down as the test runs.

:::info
Installation prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download).
- [Visual Studio Code](https://code.visualstudio.com/) with [C#](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp) extension installed.
:::

### Create console application project

```code
dotnet new console -n [project_name] -lang ["C#"]
```
```code
dotnet new console -n MyLoadTest -lang "C#"
cd MyLoadTest
```

### Add NBomber package

```code
dotnet add package NBomber
```

### Create hello world load test

Let's first start with an empty hello world example to get more familiar with NBomber. In this example, we will define one simple Step and Scenario which does nothing.


```csharp title="Program.cs"
using System;
using System.Threading.Tasks;
using NBomber.CSharp;

namespace MyLoadTest
{
    class Program
    {
        static void Main(string[] args)
        {   
            var scenario = Scenario.Create("hello_world_scenario", async context =>
            {
                // you can define and execute any logic here,
                // for example: send http request, SQL query etc
                // NBomber will measure how much time it takes to execute your logic
                await Task.Delay(1_000);

                return Response.Ok();
            })
            .WithoutWarmUp()
            .WithLoadSimulations(
                Simulation.Inject(rate: 10,
                                  interval: TimeSpan.FromSeconds(1),
                                  during: TimeSpan.FromSeconds(30))
            );

            NBomberRunner
                .RegisterScenarios(scenario)
                .Run();
        }
    }
}
```

### Run load test

```code
dotnet run -c Release
```

After running a test you will get a report. Don't get scared, we can skip it for now. Later we will understand how to analyse such reports.

### Create simple HTTP load test (not production-ready)

Now, let's add HTTP client to test a web server and then run it. 

```csharp title="Program.cs"
using System;
using System.Threading.Tasks;
using System.Net.Http;
using NBomber.CSharp;

namespace MyLoadTest
{
    class Program
    {
        static void Main(string[] args)
        {   
            using var httpClient = new HttpClient();

            var scenario = Scenario.Create("hello_world_scenario", async context =>
            {
                var response = await httpClient.GetAsync("https://nbomber.com");

                return response.IsSuccessStatusCode
                    ? Response.Ok()
                    : Response.Fail();
            })
            .WithoutWarmUp()
            .WithLoadSimulations(
                Simulation.Inject(rate: 10,
                                  interval: TimeSpan.FromSeconds(1),
                                  during: TimeSpan.FromSeconds(30))
            );

            NBomberRunner
                .RegisterScenarios(scenario)
                .Run();
        }
    }
}
```

Now, let's add more requests. NBomber uses the **Load Simulation** concept to configure concurrency. Also, you can ramp the number of requests up and down during the test. To configure ramping, use the **RampingInject** simulation. 

```csharp
// In this example, we configure 
// (RampingInject) - ramp up from 0 to 200 requests per second for 1 minute,
// (Inject) - then we keep the rate of 200 for the next 30 sec.*

.WithLoadSimulations(
    Simulation.RampingInject(rate: 200, 
                             interval: TimeSpan.FromSeconds(1),
                             during: TimeSpan.FromMinutes(1)),
    
    Simulation.Inject(rate: 200,
                      interval: TimeSpan.FromSeconds(1),
                      during: TimeSpan.FromSeconds(30))
);
```

### Create production-ready HTTP load test

Now, you got a basic understanding of NBomber and ready to move on. This time we will use:
- [NBomber.Http](https://github.com/PragmaticFlow/NBomber.Http) - plugin to simplify defining and handling of HTTP

To proceed we only need to install NBomber.Http package.

```code
dotnet add package NBomber.Http
```

This plugin helps you to construct HTTP request messages and send them.

```csharp title="Program.cs"
using System;
using System.Threading.Tasks;
using System.Net.Http;

using NBomber.CSharp;
using NBomber.Http.CSharp;

namespace NBomberTest
{
    class Program
    {
        static void Main(string[] args)
        {
            using var httpClient = new HttpClient();

            var scenario = Scenario.Create("http_scenario", async context =>
            {
                var request =
                    Http.CreateRequest("GET", "https://nbomber.com")
                        .WithHeader("Accept", "text/html");
                        // .WithHeader("Accept", "application/json")
                        // .WithBody(new StringContent("{ id: 1 }", Encoding.UTF8, "application/json");
                        // .WithBody(new ByteArrayContent(new [] {1,2,3}))
                        

                var response = await Http.Send(httpClient, request);

                return response;
            })
            .WithoutWarmUp()
            .WithLoadSimulations(
                Simulation.Inject(rate: 100, 
                                  interval: TimeSpan.FromSeconds(1),
                                  during: TimeSpan.FromSeconds(30))
            );

            NBomberRunner
                .RegisterScenarios(scenario)
                .Run();
            }
    }
}
```

## Congratulations! You have done it!

Finally, you reach this point! Here you can find additional information which helps you in building real world NBomber tests:

<!-- - [Learn general concepts](general-concepts)
- [Loadtesting basics](loadtesting-basics) -->
- [Examples](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/CSharpProd)