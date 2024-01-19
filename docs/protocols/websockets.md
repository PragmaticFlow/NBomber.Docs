---
id: websockets
title: WebSockets
sidebar_position: 1
---

import WebSocketsImage from './img/web_sockets.jpg'; 

<center><img src={WebSocketsImage} width="50%" height="50%" /></center>

WebSockets is a protocol that provides full-duplex communication channels over a single TCP connection. It is commonly used by single-page apps (SPAs) and mobile apps, to add server-push based functionality, which usually improves performance. Also, it is used for applications that require real-time communication.

To work with WebSockets, NBomber provides [NBomber.WebSockets](https://github.com/PragmaticFlow/NBomber.WebSockets) plugin. 

:::info
To install [NBomber.WebSockets](https://www.nuget.org/packages/nbomber.websockets/) package you should execute the following *dotnet* command:

[![build](https://github.com/PragmaticFlow/NBomber.WebSockets/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.WebSockets)
[![NuGet](https://img.shields.io/nuget/v/nbomber.websockets.svg)](https://www.nuget.org/packages/nbomber.websockets/)

```code
dotnet add package NBomber.WebSockets
```
:::

## WebSockets API

`NBomber.WebSockets` plugin provides `WebSocket` type that is wrapper over native [ClientWebSocket](https://learn.microsoft.com/en-us/dotnet/api/system.net.websockets.clientwebsocket?view=net-8.0) that provides extenions to simplify WebSockets handling.

- `Send` and `Receive` methods use reusable memory pools to reduce memory allocations.
- `Receive` method follows Pull-based semantics that simplifies writing load test scenarios due to the liner composition of the request/response handling.

```csharp
var scenario = Scenario.Create("web_sockets", async context =>
{    
    using var websocket = new WebSocket(new WebSocketConfig());    

    var connect = await Step.Run("connect", context, async () =>
    {        
        await websocket.Connect("ws://localhost:5231/ws");     
        return Response.Ok();
    });

    var ping = await Step.Run("ping", context, async () =>
    {        
        await websocket.Send(payload);     
        return Response.Ok(sizeBytes: payload.Length);
    });

    var pong = await Step.Run("pong", context, async () =>
    {        
        using var response = await websocket.Receive();        
        return Response.Ok(sizeBytes: response.Data.Length);
    });

    var disconnect = await Step.Run("disconnect", context, async () =>
    {        
        await websocket.Close();        
        return Response.Ok();
    });

    return Response.Ok();
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/WebSockets/PingPongWebSocketsTest.cs).*

### Connect

This method should be used to connect to a WebSocket server asynchronously.

```csharp
public Task Connect(string url, CancellationToken cancellationToken = default);

public Task Connect(Uri uri, CancellationToken cancellationToken = default);
```

Example:

```csharp
using var websocket = new WebSocket(new WebSocketConfig());

await websocket.Connect("ws://localhost:5231/ws");
```

### Send

This method should be used to send data on WebSocket asynchronously.

```csharp
public ValueTask Send(string text, CancellationToken cancellationToken = default);

public ValueTask Send(ReadOnlyMemory<byte> payload, CancellationToken cancellationToken = default);
```

Example 1: in this example, we will send a plain text. The text will be encoded using UTF8 encoding.

```csharp
var step = await Step.Run("send", context, async () =>
{
    string command = "ping";    
    await websocket.Send(command);

    return Response.Ok(sizeBytes: command.Length);
});
```

Example 2: in this example, we will send a binary payload.

```csharp
var step = await Step.Run("send", context, async () =>
{
    byte[] data = Encoding.UTF8.GetBytes("pong");
    await websocket.Send(data);
    
    return Response.Ok(sizeBytes: data.Length);
});
```

### Receive

This method should be used to receive a WebSocket message from the connected WebSocket asynchronously.

:::tip
This method returns `WebSocketResponse` that should be disposed of after usage.
:::

```csharp
public ValueTask<WebSocketResponse> Receive(CancellationToken cancellationToken = default);
```

Example: in this example, we will receive a WebSocket message.

```csharp
var ping = await Step.Run("send", context, async () =>
{
    await websocket.Send(payload);
    return Response.Ok(sizeBytes: payload.Length);
});

var pong = await Step.Run("receive", context, async () =>
{
    // highlight-start
    using var response = await websocket.Receive();    
    // highlight-end

    return Response.Ok(sizeBytes: response.Data.Length);
});
```

### Close

This method should be used to close WebSocket connection asynchronously.

```csharp
public Task Close(WebSocketCloseStatus closeStatus = WebSocketCloseStatus.NormalClosure, CancellationToken cancellationToken = default);
```

Example:

```csharp
var ping = await Step.Run("disconnect", context, async () =>
{
    await websocket.Close();
    return Response.Ok();
});
```
