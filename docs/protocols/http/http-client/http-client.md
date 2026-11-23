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

HTTP plugin provides helper methods that work with native [HttpClient](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient). These methods help reduce the boilerplate needed to build `HttpRequestMessage`, send or receive JSON objects, calculate data transfer, etc.

Basic Example:

```csharp
using NBomber.CSharp;
using NBomber.Http.CSharp;

var httpClient = Http.CreateDefaultClient();

var scenario = Scenario.Create("http_scenario", async context =>
{
    var request =
        Http.CreateRequest("GET", "https://nbomber.com")
            .WithHeader("Accept", "text/html");

    var response = await httpClient.SendRequest(request);

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
                .WithHeader("Accept", "text/html");

        var response = await httpClient.SendRequest(request);

        return response;
    });

    // example of sending JSON as a body
    // WithJsonBody(data) serializes the object to JSON
    // and adds the header "Content-Type: application/json"

    var step2 = await Step.Run("step_2", context, async () =>
    {
        var user = new UserData { UserId = 1, Title = "test user" };

        var request =
            Http.CreateRequest("POST", "https://nbomber.com")
                .WithJsonBody(user);

        var response = await httpClient.SendRequest(request);

        return response;
    });

    // example of SendRequest<TResponse>
    // it sends the HTTP request
    // and deserializes the JSON response to a specific type

    var step3 = await Step.Run("step_3", context, async () =>
    {
        var request =
            Http.CreateRequest("GET", "https://jsonplaceholder.typicode.com/todos/1")
                .WithHeader("Accept", "application/json");

        var response = await httpClient.SendRequest<UserData>(request);

        // user: UserData
        var user = response.Payload.Value.Data;
        var userId = user.UserId;

        return response;
    });

    // example of a timeout for one request with CancellationToken

    var step4 = await Step.Run("step_4", context, async () =>
    {
        using var timeout = new CancellationTokenSource();
        timeout.CancelAfter(50); // the request will be canceled after 50 ms

        var request =
            Http.CreateRequest("GET", "https://jsonplaceholder.typicode.com/todos/1")
                .WithHeader("Accept", "application/json");

        var response = await httpClient.SendRequest(request, cancellationToken: timeout.Token);

        return response;
    });

    return Response.Ok();
});
```

### CreateDefaultClient

This method creates a preconfigured instance of HttpClient. All parameters are optional.

```csharp
static HttpClient CreateDefaultClient(
    int maxConnectionsPerServer = 5000,
    TimeSpan? pooledConnectionLifetime = null,  // 3 minutes
    DnsSelection dnsSelection = DnsSelection.Random,
    string httpVersion = "2.0",
    HttpVersionPolicy versionPolicy = HttpVersionPolicy.RequestVersionOrLower,
    DecompressionMethods automaticDecompression = DecompressionMethods.None,
    TimeSpan? requestTimeout = null)            // 1 minute
```

<Since version="NBomber.Http 7.0.0" /> All parameters except `maxConnectionsPerServer` are available starting from 7.0.0. For a description of each parameter, see [Connections & HTTP versions](./connections.md#createdefaultclient-parameters).

:::info
We highly recommend using `CreateDefaultClient` instead of the default constructor `new HttpClient()`. `CreateDefaultClient` applies important settings to the underlying [SocketsHttpHandler](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.socketshttphandler), including:

- MaxConnectionsPerServer: 5000
- Timeout: 1 minute
- PooledConnectionLifetime: 3 minutes
- PooledConnectionIdleTimeout: 1.5 minutes
- HTTP/2 if the server supports it, otherwise HTTP/1.1
- A new HTTP/2 connection opens when the current connections reach the server's limit of parallel streams
- If the host name resolves to several IP addresses, connections are spread over all of them

These settings enhance connection management and ensure more efficient use of network resources.
:::

Example:

```csharp
var httpClient = Http.CreateDefaultClient();

// or with custom settings
var httpClient = Http.CreateDefaultClient(
    maxConnectionsPerServer: 1000,
    httpVersion: "1.1",
    requestTimeout: TimeSpan.FromSeconds(30)
);
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
                      .WithHeader("Accept", "text/html");
                      // .WithBody(new StringContent("{ id: 1 }", Encoding.UTF8, "application/json"))
                      // .WithBody(new ByteArrayContent(new [] {1,2,3}))
    ...
});
```

You can configure the request with these extension methods:

| Method | Description |
|---|---|
| `WithHeader(name, value)` | Adds an HTTP header to the request. |
| `WithBody(content)` | Sets the request body (`HttpContent`). |
| `WithJsonBody(data, options, compression)` | Serializes `data` to JSON, sets it as the body and adds the `Content-Type: application/json` header. See [JSON support](./json.md#send-json). <Since version="NBomber.Http 7.0.0" /> The `compression` parameter. |
| `WithVersion(version)` | Sets the HTTP version of the request, for example `"1.1"` or `"2.0"`. <Since version="NBomber.Http 7.0.0" /> This version has priority over the `httpVersion` of `CreateDefaultClient`. |
| `WithCompression(compression)` | <Since version="NBomber.Http 7.0.0" /> Compresses the request body with gzip or Brotli. See [Compression](./compression.md#request-compression). |

### SendRequest

<Since version="NBomber.Http 7.0.0" />

This extension method of `HttpClient` sends an HTTP request and returns an NBomber response. NBomber uses it to track the status code and the [data transfer](#data-transfer-tracking) of each request. A 2xx response is OK, other status codes are failed.

```csharp
Task<Response<HttpResponseMessage>> SendRequest(
    this HttpClient client,
    HttpRequestMessage request,
    ILogger logger = null,
    string traceId = null,
    HttpCompletionOption httpCompletion = HttpCompletionOption.ResponseContentRead,
    CancellationToken cancellationToken = default)

Task<Response<HttpResponse<T>>> SendRequest<T>(
    this HttpClient client,
    HttpRequestMessage request,
    JsonSerializerOptions jsonOptions = null,
    ILogger logger = null,
    string traceId = null,
    HttpCompletionOption httpCompletion = HttpCompletionOption.ResponseContentRead,
    CancellationToken cancellationToken = default)
```

All parameters after `request` are optional. Pass only the ones you need, by name:

| Parameter | Description |
|---|---|
| `jsonOptions` | Only `SendRequest<T>`. The JSON serializer options for the response body. If not set, `Http.GlobalJsonSerializerOptions` is used. See [Serializer options](./json.md#serializer-options). |
| `logger` | The logger for HTTP tracing, for example `context.Logger`. If not set, tracing is disabled. See [Tracing HTTP requests](#tracing-http-requests). |
| `traceId` | The trace id that is written to the logs. If not set and `logger` is set, a new GUID is used. |
| `httpCompletion` | Defines when the operation completes: after the whole body is read (`ResponseContentRead`, default) or after the headers are read (`ResponseHeadersRead`). |
| `cancellationToken` | The token that cancels the request. For `SendRequest<T>`, it also cancels reading the response body. See [Timeout](#timeout). |

Example:

```csharp
var httpClient = Http.CreateDefaultClient();

var scenario = Scenario.Create("http_scenario", async context =>
{
    var request = Http.CreateRequest("GET", "https://nbomber.com")
                      .WithHeader("Accept", "text/html");

    var response = await httpClient.SendRequest(request);

    // or with optional parameters
    // var response = await httpClient.SendRequest(request, logger: context.Logger, cancellationToken: token);

    return response;
});
```

### Timeout

If you create an HttpClient using `Http.CreateDefaultClient()`, the default timeout is 1 minute. To change it, use the `requestTimeout` parameter <Since version="NBomber.Http 7.0.0" />:

```csharp
var httpClient = Http.CreateDefaultClient(requestTimeout: TimeSpan.FromMinutes(5));

// or set it manually
var httpClient = Http.CreateDefaultClient();
httpClient.Timeout = TimeSpan.FromMinutes(5);
```

If you want more granular control over timeouts, you can pass a `CancellationToken` for one request. Make sure that your custom timeout is not longer than the client timeout: the shorter timeout cancels the request.

```csharp
var scenario = Scenario.Create("http_scenario", async context =>
{
    using var timeout = new CancellationTokenSource();
    timeout.CancelAfter(50); // the request will be canceled after 50 ms

    var request =
        Http.CreateRequest("GET", "https://jsonplaceholder.typicode.com/todos/1")
            .WithHeader("Accept", "application/json");

    var response = await httpClient.SendRequest(request, cancellationToken: timeout.Token);

    return response;
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/HttpWithTimeoutExample.cs).*

### Tracing HTTP requests

The HTTP plugin supports tracing requests and corresponding responses. To do this, pass a logger to `SendRequest`. You can also pass your own `traceId`. If you don't, a new GUID is used.

```csharp
var httpClient = Http.CreateDefaultClient();

var scenario = Scenario.Create("http_scenario", async context =>
{
    var request =
        Http.CreateRequest("GET", "https://jsonplaceholder.typicode.com/todos/1")
            .WithHeader("Accept", "application/json");

    // highlight-start
    var response = await httpClient.SendRequest(request, logger: context.Logger);
    // or with your own trace id
    // var response = await httpClient.SendRequest(request, logger: context.Logger, traceId: "user_1");
    // highlight-end

    return response;
});
```

After running this example, we will have a log file populated with HTTP tracing. Each trace message contains correspondent `TraceId`. The messages are written with the `Debug` level.

```csharp title="nbomber-log-20240406.txt"
2024-04-06 10:56:11.090 +03:00 [DBG] [ThreadId:7] HTTP Request:
// highlight-start
 TraceId: 30774c79337a4d3e9c6fa897bdb87ad1
// highlight-end
 Method: GET
 RequestUri: "https://jsonplaceholder.typicode.com/todos/1"
 HttpVersion: 2.0
 Headers: Accept: application/json
 Content:

2024-04-06 10:56:11.994 +03:00 [DBG] [ThreadId:9] HTTP Response:
// highlight-start
 TraceId: 30774c79337a4d3e9c6fa897bdb87ad1
// highlight-end
 HttpVersion: 2.0
 StatusCode: "OK"
 ReasonPhrase: OK
 Headers: Date: Sat, 06 Apr 2024 07:56:10 GMT, Vary: Origin, Accept-Encoding, Access-Control-Allow-Credentials: true, Cache-Control: max-age=43200, Pragma: no-cache, X-Content-Type-Options: nosniff, ETag: W/"53-hfEnumeNh6YirfjyjaujcOPPT+s", Via: 1.1 vegur, CF-Cache-Status: HIT, Age: 23727, Accept-Ranges: bytes, Server: cloudflare
 Content: {
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/HttpRequestTracing.cs).*

### Data transfer tracking

For each request, NBomber reports the size of the request and the response in the data transfer statistics. The size is counted as HTTP/1.1 sends it: the request or status line, the headers and the body.

<Since version="NBomber.Http 7.0.0" /> The size calculation is more accurate:

- The request size includes the headers that `HttpClient` adds when it sends the request: `DefaultRequestHeaders`, cookies, `Content-Length`.
- A request body without a known length (for example, `JsonContent` or a `StreamContent`) is counted while it is sent.
- A response body without `Content-Length` (for example, chunked) is counted when the body is read with `ResponseContentRead` (default). With `httpCompletion: HttpCompletionOption.ResponseHeadersRead`, such a body isn't counted, because it isn't received yet when the step ends.
- Responses without a body (to a `HEAD` request, 1xx, 204, 304) have a body size of 0.
- A compressed body is counted with its compressed size, the bytes that were sent over the network. See [Compression](./compression.md).

The framing isn't counted: HTTP/1.1 chunk markers, HTTP/2 and HTTP/3 frames and header compression.

## Migrating to 7.0.0

What to expect when you upgrade from NBomber.Http 6.x:

- **C# code compiles without changes.** Calls to `Http.Send` show an obsolete warning. Replace them with `SendRequest` (see [API changes](#api-changes)).
- **Rebuild assemblies that were compiled against 6.x.** The signatures of `CreateDefaultClient` and `WithJsonBody` changed (new optional parameters). A shared library that was compiled against NBomber.Http 6.x and isn't rebuilt fails at runtime with `MissingMethodException`.
- **F#: `Http.createDefaultClient2` was removed.** Use `Http.createDefaultClient(maxConnectionsPerServer = ...)`.
- **Some defaults changed**, so the same test can send different requests and produce different results. Read the [behavior changes](#behavior-changes) to keep the old behavior where you need it.

### API changes

| 6.x | 7.0.0 |
|---|---|
| `Http.Send(httpClient, request)` | `httpClient.SendRequest(request)` |
| `Http.Send<T>(httpClient, request)` | `httpClient.SendRequest<T>(request)` |
| `HttpClientArgs.Create(cancellationToken)` | `SendRequest(request, cancellationToken: token)` |
| `HttpClientArgs.Create(logger: context.Logger)` | `SendRequest(request, logger: context.Logger)` |
| `HttpClientArgs.Create(jsonOptions: options)` | `SendRequest<T>(request, jsonOptions: options)` |
| `HttpClientArgs.Create(httpCompletion: completion)` | `SendRequest(request, httpCompletion: completion)` |
| `httpClient.Timeout = timeout` | `Http.CreateDefaultClient(requestTimeout: timeout)` (both work) |
| F#: `Http.createDefaultClient2 maxConnections` | F#: `Http.createDefaultClient(maxConnectionsPerServer = maxConnections)` |

Example:

```csharp
// 6.x
var clientArgs = HttpClientArgs.Create(timeout.Token, logger: context.Logger);
var response = await Http.Send<UserData>(httpClient, clientArgs, request);

// 7.0.0
var response = await httpClient.SendRequest<UserData>(request, logger: context.Logger, cancellationToken: timeout.Token);
```

### Behavior changes

| Change | 6.x | 7.0.0 | To keep the 6.x behavior |
|---|---|---|---|
| HTTP version of `CreateDefaultClient` | HTTP/1.1 | HTTP/2 if the server supports it (`https` URLs), otherwise HTTP/1.1 | `CreateDefaultClient(httpVersion: "1.1")` |
| Connection lifetime (`PooledConnectionLifetime`) | 10 minutes | 3 minutes | `CreateDefaultClient(pooledConnectionLifetime: TimeSpan.FromMinutes(10))` |
| Idle connection timeout (`PooledConnectionIdleTimeout`) | 5 minutes | 1.5 minutes | Not configurable. Create your own `HttpClient`. |
| IP address of a new connection | The first resolved address | A random resolved address | `CreateDefaultClient(dnsSelection: DnsSelection.First)` |
| `WithJsonBody` serializer options | .NET default options (`PascalCase` property names) | `Http.GlobalJsonSerializerOptions` (`JsonSerializerOptions.Web`, `camelCase` property names) | `WithJsonBody(data, new JsonSerializerOptions())` |
| `Send<T>` with a 2xx body that isn't valid JSON | OK, `Data` is `default(T)` | Failed, with the deserialization error in `Message` | - |
| `Send<T>` with a non-2xx response | The body is deserialized | The body isn't deserialized, `Data` is `default(T)` | Read `Response.Content` |
| Data transfer size | Approximate | More accurate (see [Data transfer tracking](#data-transfer-tracking)) | - |