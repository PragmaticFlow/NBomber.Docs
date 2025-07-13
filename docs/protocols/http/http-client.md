---
id: http-client
title: HttpClient
sidebar_position: 1
---

To work with HTTP, NBomber provides [NBomber.Http](https://github.com/PragmaticFlow/NBomber.Http) plugin for the native .NET [HttpClient](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient). This plugin offers useful extensions that simplify creating and sending requests, receiving responses, and tracking data transfer and status codes.

:::info
You can find the [source code here](https://github.com/PragmaticFlow/NBomber.Http).

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
var httpClient = Http.CreateDefaultClient();

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
var httpClient = Http.CreateDefaultClient();

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

### CreateDefaultClient

This method creates a default preconfigured instance of HttpClient. 

```csharp
HttpClient CreateDefaultClient(int maxConnectionsPerServer = 5000)
```

:::info
We highly recommend using `CreateDefaultClient` instead of using the default constructor `new HttpClient()`. This is because `CreateDefaultClient` applies important preconfigured settings to the underlying [SocketsHttpHandler](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.socketshttphandler), including:

- MaxConnectionsPerServer: 5000
- Timeout: 1 minute
- PooledConnectionLifetime: 10 minutes
- PooledConnectionIdleTimeout: 5 minutes

These settings enhance connection management and ensure more efficient use of network resources.
:::

Example:
```csharp
var httpClient = Http.CreateDefaultClient();
```

### CreateRequest

This method should be used to create HTTP request. 

```csharp
static HttpRequestMessage CreateRequest(string method, string url)
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
static Task<Response<HttpResponseMesage>> Send(HttpClient client, HttpRequestMessage request);

static Task<Response<HttpResponseMesage>> Send(HttpClient client, HttpClientArgs clientArgs, HttpRequestMessage request);
```

Example 1:

```csharp
var httpClient = Http.CreateDefaultClient();

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
var httpClient = Http.CreateDefaultClient();

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
var httpClient = Http.CreateDefaultClient();

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
var httpClient = Http.CreateDefaultClient();

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
**Configuring JSON serialization**. You can set global serializer options for JSON serialization as follow:

```csharp
// By default GlobalJsonSerializer is configured with JsonSerializerOptions.Web
Http.GlobalJsonSerializerOptions = JsonSerializerOptions.Web;

// You may also customize the configuration to suit your specific needs
Http.GlobalJsonSerializerOptions = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};
```

If the default `GlobalJsonSerializerOptions` doesn't fit for your use case and you need more granular control, you can pass different serializer options for each request via **HttpClientArgs**.

```csharp
var clientArgs = HttpClientArgs.Create(
    CancellationToken.None,
    httpCompletion: HttpCompletionOption.ResponseContentRead,
    jsonOptions: JsonSerializerOptions.Web // you set custom options
);
        
var response = await Http.Send(httpClient, clientArgs, request);
```
:::

### Timeout

If you create an HttpClient using `Http.CreateDefaultClient()`, the default timeout is 1 minute. To change the default timeout, you can set it manually:

```csharp
var httpClient = Http.CreateDefaultClient();
httpClient.Timeout = TimeSpan.FromMinutes(5);
```

Alternatively, if you want more granular control over timeouts, you can use `CancellationTokenSource`. Just make sure that your custom timeout is not longer than the default `HttpClient.Timeout`; you may need to adjust the default timeout accordingly.

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
var httpClient = Http.CreateDefaultClient();

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

### Connections limit

You may need to restrict the maximum number of socket connections.

```csharp
var httpClient = Http.CreateDefaultClient(maxConnectionsPerServer: 3);
```