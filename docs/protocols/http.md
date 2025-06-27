---
id: http
title: HTTP
sidebar_position: 0
---

import ConsoleMetricsImage from './img/console_metrics.jpg';
import HTMLHistoryMetricsImage from './img/html_history_metrics.jpg';

To work with HTTP, NBomber provides [NBomber.Http](https://github.com/PragmaticFlow/NBomber.Http) plugin that includes:
- API to create, send request, receive response with tracking of data transfer and status codes.
- [HttpMetricsPlugin](#httpmetricsplugin) to get real-time metrics about the current Http connections.

:::info
To install [NBomber.Http](https://www.nuget.org/packages/nbomber.http) package you should execute the following *dotnet* command:

[![build](https://github.com/PragmaticFlow/NBomber.Http/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.Http)
[![NuGet](https://img.shields.io/nuget/v/nbomber.http.svg)](https://www.nuget.org/packages/nbomber.http/)

```code
dotnet add package NBomber.Http
```
:::

## HTTP API

HTTP plugin provides helper methods that works with native [HttpClient](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient?view=net-8.0). These methods help reduce the boilerplate needed to build `HttpRequestMessage`, send or receive JSON objects, calculate data transfer, etc. 

Basic Example:

```csharp
using var httpClient = new HttpClient();

var scenario = Scenario.Create("http_scenario", async context =>
{   
    var request =
        Http.CreateRequest("GET", "https://nbomber.com")
            .WithHeader("Content-Type", "application/json")
            .WithBody(new StringContent("{ some JSON }", Encoding.UTF8, "application/json"));

    var response = await Http.Send(httpClient, request);

    return response;
});

```

Advanced Example:

```csharp
using var httpClient = new HttpClient();

var scenario = Scenario.Create("http_scenario", async context =>
{
    var step1 = await Step.Run("step_1", context, async () =>
    {
        var request =
            Http.CreateRequest("GET", "https://nbomber.com")
                .WithHeader("Content-Type", "application/json")
                .WithBody(new StringContent("{ some JSON }", Encoding.UTF8, "application/json"));

        var response = await Http.Send(httpClient, request);

        return response;
    });

    // example of sending JSON as a body 
    // Http.WithJsonBody<T>() will automatically serialize object to JSON
    // the header "Content-Type": "application/json" will be added automatically

    var step2 = await Step.Run("step_2", context, async () =>
    {
        var user = new UserData { UserId = 1, Title = "test user" };

        var request = 
            Http.CreateRequest("POST", "https://nbomber.com")
                .WithJsonBody(user);
        
        var response = await Http.Send(httpClient, request);

        return response;
    });

    // example of using Http.Send<TResponse>
    // it sends HTTP request 
    // and deserialize JSON response to specific type

    var step3 = await Step.Run("step_3", context, async () =>
    {
        var request = 
            Http.CreateRequest("GET", "https://jsonplaceholder.typicode.com/todos/1")
                .WithHeader("Content-Type", "application/json");

        var response = await Http.Send<UserData>(httpClient, request);

        // user: UserData        
        var user = response.Payload.Value.Data;
        var userId = user.UserId;

        return response;
    });

    // example of using CancellationToken for timeout operation

    var step4 = await Step.Run("step_4", context, async () =>
    {
        using var timeout = new CancellationTokenSource();
        timeout.CancelAfter(50); // the operation will be canceled after 50 ms

        var clientArgs = HttpClientArgs.Create(timeout.Token);

        var request = 
            Http.CreateRequest("GET", "https://jsonplaceholder.typicode.com/todos/1")
                .WithHeader("Content-Type", "application/json");

        var response = await Http.Send(httpClient, clientArgs, request);

        return response;
    });

    return Response.Ok();
});
```

### CreateRequest

This method should be used to create HTTP request. 

```csharp
public static HttpRequestMessage CreateRequest(string method, string url)
```

Example:

```csharp
var scenario = Scenario.Create("http_scenario", async context =>
{
    var request = Http.CreateRequest("GET", "https://nbomber.com")
                      .WithHeader("Content-Type", "text/html");
                      // .WithHeader("Content-Type", "application/json")
                      // .WithBody(new StringContent("{ id: 1 }", Encoding.UTF8, "application/json");
                      // .WithBody(new ByteArrayContent(new [] {1,2,3}))
    ... 
});
```

### Send

This method should be used to send HTTP request.

```csharp
public static Task<Response<HttpResponseMesage>> Send(HttpClient client, HttpRequestMessage request);

public static Task<Response<HttpResponseMesage>> Send(HttpClient client, HttpClientArgs clientArgs, HttpRequestMessage request);
```

Example 1:

```csharp
using var httpClient = new HttpClient();

var scenario = Scenario.Create("http_scenario", async context =>
{
    var request = Http.CreateRequest("GET", "https://nbomber.com")
                      .WithHeader("Content-Type", "text/html");
                      // .WithHeader("Content-Type", "application/json")
                      // .WithBody(new StringContent("{ id: 1 }", Encoding.UTF8, "application/json");
                      // .WithBody(new ByteArrayContent(new [] {1,2,3}))
    
    var response = await Http.Send(httpClient, request);

    return response;
});
```

Example 2: in this example we use [HttpClientArgs](#httpclientargs).

```csharp
using var httpClient = new HttpClient();

var scenario = Scenario.Create("http_scenario", async context =>
{
    var request = Http.CreateRequest("GET", "https://nbomber.com")
                      .WithHeader("Content-Type", "application/json");
                      // .WithHeader("Content-Type", "application/json")
                      // .WithBody(new StringContent("{ id: 1 }", Encoding.UTF8, "application/json");
                      // .WithBody(new ByteArrayContent(new [] {1,2,3}))    
    
    var clientArgs = HttpClientArgs.Create(
        CancellationToken.None,
        httpCompletion: HttpCompletionOption.ResponseContentRead,
        jsonOptions: JsonSerializerOptions.Default
    );
            
    var response = await Http.Send(httpClient, clientArgs, request);

    return response;
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/HttpClientArgsExample.cs).*

### JSON support

HTTP plugin provides helper methods that simplify working with JSON format.

- `Http.WithJsonBody<T>(data)` - Populates request body by serializing data record to JSON format. Also, it adds HTTP header: *"Content-Type": "application/json"*.

```csharp
using var httpClient = new HttpClient();

Http.GlobalJsonSerializerOptions = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

var scenario = Scenario.Create("http_scenario", async context =>
{    
    var user = new UserData { UserId = 1, Title = "anton" };

    var request =
        Http.CreateRequest("GET", "https://nbomber.com")
            .WithJsonBody(user);          
            
    var response = await Http.Send(httpClient, request);

    return response;
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/HttpSendJsonExample.cs).*

- `Http.Send<TResponse>` - Send request and deserialize HTTP response body to JSON format.

```csharp
using var httpClient = new HttpClient();

Http.GlobalJsonSerializerOptions = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

var scenario = Scenario.Create("http_scenario", async context =>
{
    var request =
        Http.CreateRequest("GET", "https://jsonplaceholder.typicode.com/todos/1")
            .WithHeader("Content-Type", "application/json");

    var response = await Http.Send<UserData>(httpClient, request);

    var userData = response.Payload.Value.Data;
    var title = userData.Title;
    var userId = userData.UserId;

    return response;    
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/HttpSendJsonExample.cs).*

:::info
For JSON serialization you can set global serializer options:

```csharp
Http.GlobalJsonSerializerOptions = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};
```

If the global serializer options doesn't fit for your use case and you need more granular control, you can pass different serializer options for each request via **HttpClientArgs**.

```csharp
var clientArgs = HttpClientArgs.Create(
    CancellationToken.None,
    httpCompletion: HttpCompletionOption.ResponseContentRead,
    jsonOptions: JsonSerializerOptions.Default // you set custom options
);
        
var response = await Http.Send(httpClient, clientArgs, request);
```
:::

### Timeout operation

```csharp
var scenario = Scenario.Create("http_scenario", async context =>
{
    using var timeout = new CancellationTokenSource();
    timeout.CancelAfter(50); // the operation will be canceled after 50 ms

    var clientArgs = HttpClientArgs.Create(timeout.Token);

    var request = 
        Http.CreateRequest("GET", "https://jsonplaceholder.typicode.com/todos/1")
            .WithHeader("Content-Type", "application/json");

    var response = await Http.Send(httpClient, clientArgs, request);

    return response;
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/HttpWithTimeoutExample.cs).*

### HttpClientArgs

HttpClientArgs represents a structure that can configure HTTP clients per request. You can use it to set request timeout, or `JsonSerializerOptions`.

Example:

```csharp
var scenario = Scenario.Create("http_scenario", async context =>
{
    var request =
        Http.CreateRequest("GET", "https://nbomber.com")
            .WithHeader("Content-Type", "application/json");
            .WithBody(new StringContent("{ some JSON }", Encoding.UTF8, "application/json"));

    var clientArgs = HttpClientArgs.Create(
        CancellationToken.None,
        httpCompletion: HttpCompletionOption.ResponseHeadersRead, // or ResponseContentRead
        jsonOptions: new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }
    );

    var response = await Http.Send(httpClient, clientArgs, request);

    return response;
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/HttpClientArgsExample.cs).*

### Tracing HTTP requests

The HTTP plugin supports tracing requests and corresponding responses. To do this, you need to pass `Logger` into `HttpClientArgs`.

```csharp
using var httpClient = new HttpClient();

var scenario = Scenario.Create("http_scenario", async context =>
{
    var request =
        Http.CreateRequest("GET", "https://jsonplaceholder.typicode.com/todos/1")
            .WithHeader("Content-Type", "application/json");

    // highlight-start
    var clientArgs = HttpClientArgs.Create(logger: context.Logger);
    // highlight-end

    var response = await Http.Send(httpClient, clientArgs, request);

    return response;
})
```

After running this example, we will have a log file populated with HTTP tracing. Each trace message contains correspondent `TraceId`.

```csharp title="nbomber-log-20240406.txt"
2024-04-06 10:56:11.090 +03:00 [DBG] [ThreadId:7] HTTP Request:
// highlight-start
 TraceId: 30774c79337a4d3e9c6fa897bdb87ad1
// highlight-end
 Method: GET
 RequestUri: "https://jsonplaceholder.typicode.com/todos/1"
 HttpVersion: 1.1
 Headers: Content-Type: application/json
 Content: 

2024-04-06 10:56:11.994 +03:00 [DBG] [ThreadId:9] HTTP Response:
// highlight-start
 TraceId: 30774c79337a4d3e9c6fa897bdb87ad1
// highlight-end
 HttpVersion: 1.1
 StatusCode: "OK"
 ReasonPhrase: OK
 Headers: Date: Sat, 06 Apr 2024 07:56:10 GMT, Connection: keep-alive, Report-To: {"group":"heroku-nel","max_age":3600,"endpoints":[{"url":"https://nel.heroku.com/reports?ts=1712102103&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&s=NEDTWuReF%2Ftx6jFV3Ve%2FTGNlbenGGlra6iQD4Wu%2BL1k%3D"}]}, Reporting-Endpoints: heroku-nel=https://nel.heroku.com/reports?ts=1712102103&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&s=NEDTWuReF%2Ftx6jFV3Ve%2FTGNlbenGGlra6iQD4Wu%2BL1k%3D, Nel: {"report_to":"heroku-nel","max_age":3600,"success_fraction":0.005,"failure_fraction":0.05,"response_headers":["Via"]}, X-Powered-By: Express, X-Ratelimit-Limit: 1000, X-Ratelimit-Remaining: 999, X-Ratelimit-Reset: 1712102115, Vary: Origin, Accept-Encoding, Access-Control-Allow-Credentials: true, Cache-Control: max-age=43200, Pragma: no-cache, X-Content-Type-Options: nosniff, ETag: W/"53-hfEnumeNh6YirfjyjaujcOPPT+s", Via: 1.1 vegur, CF-Cache-Status: HIT, Age: 23727, Accept-Ranges: bytes, Server: cloudflare, CF-RAY: 8700384848945b45-VIE, Alt-Svc: h3=":443"
 Content: {
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/HttpRequestTracing.cs).*

## HttpMetricsPlugin

HttpMetricsPlugin - provides a monitoring layer for HTTP connections.

Example:

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithWorkerPlugins(new HttpMetricsPlugin(new [] { HttpVersion.Version1 }))
    // .WithWorkerPlugins(new HttpMetricsPlugin(new [] { HttpVersion.Version1, HttpVersion.Version2 }))
    .Run();
```

After running with HttpMetricsPlugin, you will get real-time HTTP connections metrics for the Console output:

<center><img src={ConsoleMetricsImage} width="50%" height="50%" /></center>

Also, after running with HttpMetricsPlugin, you will get HTTP connections history metrics for the HTML report:

<center><img src={HTMLHistoryMetricsImage} width="100%" height="100%" /></center>

## Connections limit

You may need to limit the sockets connections count.

```csharp
var socketsHandler = new SocketsHttpHandler
{
    MaxConnectionsPerServer = 3
};

using var httpClient = new HttpClient(socketsHandler);
```

## Best practices

Here we combine best practices for writing HTTP load tests, along with useful links and important considerations.

### Blog posts
- [Load Testing HTTP API on C# with NBomber](../../blog/2023/08/16/load-testing-http-api)

### Choose the right workload
Please make sure to choose the right workload for your load tests. We recommend reviewing the following documentation:
- [Load Testing Microservices](../best-practices/microservices)
- [Load Simulation](../nbomber/load-simulation)

### HttpClient using wrong
HttpClient should be used carefully since the wrong use of it can cause **socket exhaustion** problems. You can read more about this problem in this article: [You are using HttpClient wrong](https://www.aspnetmonsters.com/2016/08/2016-08-27-httpclientwrong/). The basic recommendations are:
:::warning
- You can use a singleton HttpClient (shared instance) per Scenario. 
- If you need a separate HttpClient per virtual user (e.g., for cookie management), consider attaching it to the scenario instance via `context.ScenarioInstanceData`. (*We’ll show an example of this later*)
- Avoid disposing of HttpClient frequently, as it's a **costly operation** and can lead to **socket exhaustion** issues.
:::

Example: **Wrong Usage (Dispose per Iteration)**. This code creates and disposes HttpClient in each iteration, which can exhaust available sockets under high load, leading to degraded performance or failures.
```csharp
var scenario = Scenario.Create("my scenario", async context =>
{   
    // highlight-start
    using var httpClient = new HttpClient();
    // highlight-end
    
    var request = Http.CreateRequest("GET", "https://nbomber.com")
    var response = await Http.Send(httpClient, request);

    ...
});
```

Example: **Correct Usage (Reuse a Shared Instance Across Iterations)**. This code creates and reuses a single HttpClient instance across all concurrent requests and scenario iterations. It ensures the client is only disposed once when the test finishes — not after each iteration — preventing socket exhaustion problem.
```csharp
// highlight-start
using var httpClient = new HttpClient(); 
// highlight-end

var scenario = Scenario.Create("my scenario", async context =>
{
    var request = Http.CreateRequest("GET", "https://nbomber.com")
    var response = await Http.Send(httpClient, request);
    
    ...
});
```

### Dedicated HttpClient Per User Session
There may be cases where you need to create a separate HttpClient instance for each user session — such as when managing cookies, authentication headers, or maintaining session-specific state.

In such cases, we recommend attaching the created HttpClient instance to the scenario's `ScenarioInstanceData`, which represents the current user session.

```csharp
var scenario = Scenario.Create("cookies_management_scenario", async context =>
{
    HttpClient myClient = null;
    // highlight-start
    context.ScenarioInstanceData.TryGetValue("my_http_client", out var httpClient);
    // highlight-end

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

        // highlight-start
        context.ScenarioInstanceData["my_http_client"] = myClient;
        // highlight-end
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
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/CookiesManagementExample.cs).*

### RestSharp integration
RestSharp is a lightweight and easy-to-use HTTP client for .NET, designed to simplify sending HTTP requests and consuming RESTful web services.

:::info
To install [NBomber.RestSharp](https://www.nuget.org/packages/nbomber.restsharp) package you should execute the following *dotnet* command:

[![NuGet](https://img.shields.io/nuget/v/nbomber.restsharp.svg)](https://www.nuget.org/packages/nbomber.restsharp/)

```code
dotnet add package NBomber.RestSharp
```
:::

Two extension methods are provided for the RestClient class to facilitate HTTP request execution and response handling with additional metadata:
- Send(RestRequest). 
Executes the specified RestRequest asynchronously and returns a Response&lt;RestResponse&gt; object. The result includes response status evaluation along with size and latency metrics.
- Send&lt;TResponse&gt;(RestRequest).
Executes the specified RestRequest asynchronously, deserializes the JSON response content into the specified type TResponse, and returns a Response&lt;TResponse&gt; object. The result includes deserialized content, response status, and associated metrics.

```csharp
var scenario = Scenario.Create("restsharp_scenario", async ctx =>
{
    var options = new RestClientOptions("http://localhost:5099");
    var client = new RestClient(options);
    var request = new RestRequest("/api/pingpong/");

    return await client.Send(request);
})
.WithoutWarmUp()
.WithLoadSimulations(
    Simulation.KeepConstant(1, TimeSpan.FromSeconds(30))
);

NBomberRunner
    .RegisterScenarios(scenario)
    .Run();   
```

In addition to the general-purpose Send and Send&lt;TResponse&gt; methods, a set of specialized extension methods is provided for each standard HTTP verb (GET, POST, PUT, DELETE, etc.). These methods simplify request setup by explicitly setting the RestRequest.Method and delegating execution to the corresponding Send method.

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber.RestSharp/blob/dev/examples/Demo/PingPongExample.cs).*