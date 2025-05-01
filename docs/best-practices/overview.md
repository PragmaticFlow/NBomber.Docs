---
id: overview
title: Overview
sidebar_position: 0
---

- [HTTP](../protocols/http#best-practices)

### Blog posts
- [Load Testing HTTP API on C# with NBomber](../../blog/2023/08/16/load-testing-http-api)

### Load simulation
HTTP services should be considered as [Open system](../nbomber/load-simulation). Open systems - it's where you control the arrival rate of users. For Open systems NBomber provides the following load simulations: [Inject](../nbomber/load-simulation#inject), [RampingInject](../nbomber/load-simulation#ramping-inject) and [InjectRandom](../nbomber/load-simulation#inject-random).

### HttpClient
HttpClient should be used carefully since the wrong use of it can cause `socket exhaustion problems`. You can read more about this problem in this article: [You are using HttpClient wrong](https://www.aspnetmonsters.com/2016/08/2016-08-27-httpclientwrong/). The basic recommendations are:
- Use a singleton HttpClient (shared instance) per Scenario. 
- Do not create many HttpClient instances. Instead just reuse a single instance per Scenario.
- Disposing HttpClient is not a cheap operation. It can cause `socket exhaustion problems`.

```csharp
// this usage is WRONG
// since HttpClient will be created and disposed for each Scenario iteration

var scenario = Scenario.Create("my scenario", async context =>
{   
    using var httpClient = new HttpClient();
    
    var request = Http.CreateRequest("GET", "https://nbomber.com")
    var response = await Http.Send(httpClient, request);

    ...
});
```

```csharp
// this usage is OK
// since HttpClient will be created once and then reused for each Scenario iteration

using var httpClient = new HttpClient(); 

var scenario = Scenario.Create("my scenario", async context =>
{
    var request = Http.CreateRequest("GET", "https://nbomber.com")
    var response = await Http.Send(httpClient, request);
    
    ...
});
```

### HttpClient reuse
You can create a HttpClient for each Scenario copy/instance and cache it for further reuse.
```charp
using NBomber.CSharp;
using NBomber.Http.CSharp;

namespace Demo.HTTP
{
    class CookiesManagementExample
    {
        public void Run()
        {
            var scenario = Scenario.Create("cookies_management_scenario", async context =>
            {
                HttpClient myClient = null;
                context.ScenarioInstanceData.TryGetValue("my_http_client", out var httpClient);

                if (httpClient is null)
                {
                    myClient = new HttpClient();

                    var login = await Step.Run("login", context, async () =>
                    {
                        // WebAppSimulator address
                        var request = Http.CreateRequest("POST", "https://localhost:65385/api/CookiesAuthentication")
                            .WithJsonBody(new StringContent("""{"login": "morpheus","password": "leader"}"""));

                        var response = await Http.Send(myClient, request);

                        return response;
                    });

                    context.ScenarioInstanceData["my_http_client"] = myClient;
                }
                else
                    myClient = (HttpClient)httpClient;

                    var getData = await Step.Run("get_data", context, async () =>
                    {
                        var request = Http.CreateRequest("GET", "https://localhost:65385/api/CookiesAuthentication");

                        var response = await Http.Send(myClient, request);

                        return response;
                    });

                return Response.Ok();
            })
            .WithoutWarmUp()
            .WithLoadSimulations(Simulation.KeepConstant(copies: 10, during: TimeSpan.FromSeconds(30)));

            NBomberRunner
                .RegisterScenarios(scenario)
                .Run();
        }
    }
}
```

- [How to test PUSH Scenarios](testing-push)
