---
id: best-practices
title: Best Practices
sidebar_position: 4
---

Here we combine best practices for writing HTTP load tests, along with useful links and important considerations. *All the practices mentioned below are also applicable to RestSharp.*

## Blog posts
- [Load Testing HTTP API on C# with NBomber](../../../blog/2023/08/16/load-testing-http-api)

## Choose the right workload
Please make sure to choose the right workload for your load tests. We recommend reviewing the following documentation:
- [Load Testing Microservices](../../load-testing-101/best-practices/microservices)
- [Load Simulation](../../nbomber/load-simulation)

## Using HttpClient correctly
Using HttpClient (or RestSharp client) properly is crucial for performance, reliability, and avoiding resource exhaustion. Here are best practices when working with HttpClient. *All the practices mentioned below are also applicable to RestSharp.*

### Reuse HttpClient instance
Avoid creating a new instance per request. Creating and disposing HttpClient frequently can exhaust available sockets under heavy load. You can read more about this problem in this article: [You are using HttpClient wrong](https://www.aspnetmonsters.com/2016/08/2016-08-27-httpclientwrong/). The basic recommendations are:
:::info
- Avoid creating a new instance per request.
- It is a good practice to reuse a single HttpClient instance per Scenario.
- If you need a separate HttpClient per virtual user (e.g., for cookie management), consider attaching it to the scenario instance via `context.ScenarioInstanceData`. We describe this approach in [Dedicated HttpClient Per User Session](#dedicated-httpclient-per-user-session).
- Avoid disposing of HttpClient frequently, as it's a **costly operation** and can lead to **socket exhaustion** issues. It’s better not to dispose of it during the load test.
:::

:::warning
Example of incorrect usage: **Creating a new HttpClient for each request and disposing it** afterward can exhaust available sockets under high load, leading to degraded performance or even failures.
```csharp
var scenario = Scenario.Create("my scenario", async context =>
{   
    // highlight-start
    using var httpClient = Http.CreateDefaultClient();
    // highlight-end
    
    var request = Http.CreateRequest("GET", "https://nbomber.com")
    var response = await httpClient.SendRequest(request);

    ...
});
```
:::

:::tip
Example of correct usage: **Reuse a shared HttpClient instance for all requests**. This approach creates a single HttpClient and reuses it for all concurrent requests within one scenario.
```csharp
// highlight-start
var httpClient = Http.CreateDefaultClient();
// highlight-end

var scenario = Scenario.Create("my scenario", async context =>
{
    var request = Http.CreateRequest("GET", "https://nbomber.com")
    var response = await httpClient.SendRequest(request);
    
    ...
});
```
:::

### Dedicated HttpClient Per User Session
There may be cases where you need to create a separate HttpClient instance for each user session — such as when managing cookies, authentication headers, or maintaining session-specific state.

In such cases, we recommend attaching the created HttpClient instance to the scenario's `ScenarioInstanceData`, which represents the current user session. This dictionary belongs to one scenario copy and keeps its values between iterations, so each copy creates its HttpClient once and reuses it.

```csharp
var scenario = Scenario.Create("cookies_management_scenario", async context =>
{
    // highlight-start
    if (!context.ScenarioInstanceData.TryGetValue("my_http_client", out var client))
    {
        client = Http.CreateDefaultClient();
        context.ScenarioInstanceData["my_http_client"] = client; // store it before the login step
    }
    // highlight-end
    var httpClient = (HttpClient)client;

    // highlight-start
    if (!context.ScenarioInstanceData.ContainsKey("logged_in"))
    // highlight-end
    {
        await Step.Run("login", context, async () =>
        {
            // WebAppSimulator address
            var request = Http.CreateRequest("POST", "https://localhost:65385/api/CookiesAuthentication")
                .WithJsonBody(new { login = "morpheus", password = "leader" });

            // the session cookies are stored in this HttpClient
            return await httpClient.SendRequest(request);
        });

        // highlight-start
        context.ScenarioInstanceData["logged_in"] = true;
        // highlight-end
    }

    await Step.Run("get_data", context, async () =>
    {
        var request = Http.CreateRequest("GET", "https://localhost:65385/api/CookiesAuthentication");

        // sends the cookies of this user session only
        return await httpClient.SendRequest(request);
    });

    return Response.Ok();
});
```

:::info
The example keeps two separate keys in `ScenarioInstanceData`: one for the HttpClient and one for the login state.
- **Store the HttpClient right after you create it, before the login step.** If the login step fails, NBomber ends the current iteration, and the code after the step doesn't run. If the HttpClient isn't stored yet, it's lost, and the next iteration creates a new one. While the login keeps failing, each user session then creates a new HttpClient on every iteration, which leads to the **socket exhaustion** problem described in [Reuse HttpClient instance](#reuse-httpclient-instance).
- **Keep the login state in a separate key.** If you decide to log in based on whether the HttpClient exists, a failed login is never repeated: on the next iteration the HttpClient exists, the login is skipped, and the user session continues without cookies. With a separate `logged_in` key, a failed login is repeated on the next iteration with the same HttpClient.
:::

:::warning
Don't change `httpClient.DefaultRequestHeaders` (for example, to set the `Authorization` header after the login) on an HttpClient that all scenario copies share. Changing it while requests are in progress isn't thread-safe, and all user sessions send the last value that was set. For token-based authentication you don't need a dedicated HttpClient: store the token in `ScenarioInstanceData` and send it with each request.
```csharp
var request = Http.CreateRequest("GET", "https://nbomber.com/api/data")
    .WithHeader("Authorization", $"Bearer {token}");
```
:::

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/CookiesManagementExample.cs).*