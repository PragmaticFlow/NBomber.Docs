---
id: http
title: HTTP
sidebar_position: 0
---

[![build](https://github.com/PragmaticFlow/NBomber.Http/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.Http/actions/workflows/build.yml)
[![NuGet](https://img.shields.io/nuget/v/nbomber.http.svg)](https://www.nuget.org/packages/nbomber.http/)

import ConsoleMetricsImage from './img/console_metrics.jpg';
import HTMLHistoryMetricsImage from './img/html_history_metrics.jpg';

To work with HTTP, NBomber provides [NBomber.Http](https://github.com/PragmaticFlow/NBomber.Http) plugin that includes:
- API to create, send request, receive response with tracking of data transfer and status codes.
- [HttpMetricsPlugin](#httpmetricsplugin) to get real-time metrics about the current Http connections.

:::info
To install [NBomber.Http](https://www.nuget.org/packages/nbomber.http) package you should execute the following *dotnet* command:

```code
dotnet add package NBomber.Http
```
:::

## Http CreateRequest

This method should be used to create HTTP request. 

```csharp
public static HttpRequestMessage CreateRequest(string method, string url)
```

Example:

```csharp
var scenario = Scenario.Create("my scenario", async context =>
{
    var request = Http.CreateRequest("GET", "https://nbomber.com")
                      .WithHeader("Accept", "text/html");
                      // .WithHeader("Accept", "application/json")
                      // .WithBody(new StringContent("{ id: 1 }", Encoding.UTF8, "application/json");
                      // .WithBody(new ByteArrayContent(new [] {1,2,3}))
    ... 
});
```

## Http Send

This method should be used to send HTTP request.

```csharp
public static Task<Response<HttpResponseMesage>> Send(HttpClient client, HttpRequestMessage request);

public static Task<Response<HttpResponseMesage>> Send(HttpClient client, HttpClientArgs clientArgs, HttpRequestMessage request);
```

Example 1:

```csharp
using var httpClient = new HttpClient();

var scenario = Scenario.Create("my scenario", async context =>
{
    var request = Http.CreateRequest("GET", "https://nbomber.com")
                      .WithHeader("Accept", "text/html");
                      // .WithHeader("Accept", "application/json")
                      // .WithBody(new StringContent("{ id: 1 }", Encoding.UTF8, "application/json");
                      // .WithBody(new ByteArrayContent(new [] {1,2,3}))
    
    var response = await Http.Send(httpClient, request);

    return response;
});
```

Example 2: in this example we use HttpClientArgs

```csharp
using var httpClient = new HttpClient();

var scenario = Scenario.Create("my scenario", async context =>
{
    var request = Http.CreateRequest("GET", "https://nbomber.com")
                      .WithHeader("Accept", "application/json");
                      // .WithHeader("Accept", "application/json")
                      // .WithBody(new StringContent("{ id: 1 }", Encoding.UTF8, "application/json");
                      // .WithBody(new ByteArrayContent(new [] {1,2,3}))
    
    // with HttpClientArgs you can add:
    // -- CancellationToken
    // -- HttpCompletionOption - https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpcompletionoption?view=net-7.0

    var clientArgs = new HttpClientArgs(HttpCompletionOption.ResponseHeadersRead, CancellationToken.None);
            
    var response = await Http.Send(httpClient, clientArgs, request);

    return response;
});
```

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

<!-- ## test lifecicle
## how to read reports -->
