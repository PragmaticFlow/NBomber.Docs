---
id: restsharp
title: RestSharp
sidebar_position: 2
---

[RestSharp](https://restsharp.dev/) is a lightweight and easy-to-use HTTP client for .NET, designed to simplify sending HTTP requests and working with RESTful web services. If you prefer using RestSharp over the native .NET [HttpClient](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient), NBomber provides [NBomber.RestSharp](https://github.com/PragmaticFlow/NBomber.RestSharp) plugin to work with it.

:::info
You can find the [source code here](https://github.com/PragmaticFlow/NBomber.RestSharp).

To install [NBomber.RestSharp](https://www.nuget.org/packages/NBomber.RestSharp/) package you should execute the following *dotnet* command:

[![build](https://github.com/PragmaticFlow/NBomber.RestSharp/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.RestSharp)
[![NuGet](https://img.shields.io/nuget/v/nbomber.RestSharp.svg)](https://www.nuget.org/packages/nbomber.RestSharp/)

```code
dotnet add package NBomber.RestSharp
```
:::

## RestSharp API

Here is a basic example of using the RestSharp client with NBomber.

```csharp
var options = new RestClientOptions($"http://localhost:60529");
var client = RestClientBuilder.CreateDefaultClient(options);

var request = new RestRequest("api/users/{id}");
request.AddParameter("id", userId, ParameterType.UrlSegment);

// PUT
var response = await client.SendPut(request);

// GET
var response = await client.SendGet<User>(request);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/RestSharpDemo/RestSharpSimpleHttpExample.cs).*

### CreateDefaultClient

This method creates a default preconfigured instance of RestSharp client.

```csharp
RestClient CreateDefaultClient(int maxConnectionsPerServer = 5000)
```

:::info
We highly recommend using `CreateDefaultClient` instead of using the default constructor `new RestClient()`. This is because `CreateDefaultClient` applies important preconfigured settings to the underlying [SocketsHttpHandler](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.socketshttphandler), including:

- MaxConnectionsPerServer: 5000
- Timeout: 1 minute
- PooledConnectionLifetime: 10 minutes
- PooledConnectionIdleTimeout: 5 minutes

These settings enhance connection management and ensure more efficient use of network resources.
:::

Example:
```csharp
var options = new RestClientOptions("https://nbomber.com");
var client = RestClientBuilder.CreateDefaultClient(options);
```

### Send

To send requests, receive responses, and measure payload size, NBomber.RestSharp offers a set of methods: `SendGet, SendPost, SendPut, SendPatch, and SendDelete`. All NBomber methods follow a consistent naming pattern: `Send{HTTP_Method_Name}`.

```csharp
// GET
var request = new RestRequest("/api/pingpong/");
var response = await client.SendGet(request);

// POST wiht JSON body
var request = new RestRequest("/api/pingpong/");
request.AddJsonBody(new User("name", "last_name", 42));
var response = await client.SendPost(request);
```

In addition to the specialized `Send{HTTP_Method_Name}` methods, NBomber also provides a generic `Send` method for sending any custom request.

```csharp
// HEAD
var request = new RestRequest("/api/pingpong/");
request.Method = Method.Head;

var response = await client.Send(request);

// or Send<T>
// var response = await client.Send<T>(request);
```