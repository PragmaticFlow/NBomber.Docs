---
id: client-pool
title: Client Pool
sidebar_position: 9
---

import ClientPoolImage from './img/client-pool.jpeg';

<center><img src={ClientPoolImage} width="95%" height="95%" /></center>

ClientPool is an additional component that should be used for load tests that require reusing initialized clients (WebSockets, gRPC, Redis, etc.). There could be situations where you might need to reuse client instances with persistent connections. For example, you want to test a throughput of WebSockets API (or some database/message queue) for a hundred virtual users. Usually, such a target system requires you to open a persistent connection and reuse it for sending/receiving data through it. Your load test scenario shouldn't create and initialize a new client/connection for every turn. Instead, it should take a client/connection from a shared pool.

Let's look at these examples to understand the difference between creating a client for every turn vs. reusing a client from the client pool.

Creating a client for every turn: In this example, we create `WebsocketClient` instance for every scenario iteration, disconnect it, and clean it.

```csharp
var scenario = Scenario.Create("scenario", async context =>
{
    using var client = new WebsocketClient(url);
    
    await client.Connect();

    await client.Send("message");

    await client.Disconnect();
});
```

In this example, we avoid creating a new instance of `WebsocketClient` on each use. Instead, we retrieve an existing instance from the ClientPool. This means that all `WebsocketClient` instances are pre-created before usage. Additionally, clients are not disconnected or disposed of after each scenario iteration—they remain alive and managed within the ClientPool

```csharp
var clientPool = new ClientPool<WebsocketClient>();

var scenario = Scenario.Create("scenario", async context =>
{
    // highlight-start
    var client = clientPool.GetClient(context.ScenarioInfo.InstanceNumber);
    // highlight-end

    await client.Send("message");    
})
.WithInit(async context =>
{
    for (var i = 0; i < 10; i++)
    {
        var client = new WebsocketClient(url);    
        await client.Connect();

        // highlight-start
        clientPool.AddClient(client);
        // highlight-end
    }    
});
```

## Initializing and populating ClientPool

This method should be used to add a client to ClientPool.

```csharp
public void AddClient(T client)
```

ClientPool initialization typically occurs during the [Scenario Init](scenario#scenario-init) phase. 

```csharp
var clientPool = new ClientPool<WebsocketClient>();

var scenario = Scenario.Create("scenario", async context => 
{ 
    ... 
})
.WithInit(async context =>
{
    for (var i = 0; i < 10; i++)
    {
        var client = new WebsocketClient(url);    
        await client.Connect();

        // highlight-start
        clientPool.AddClient(client);
        // highlight-end
    }    
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/WebSockets/ClientPool/ClientPoolWebSocketsExample.cs).*

## Getting client from ClientPool

Retrieves a client from the pool based on a scenario instance number. Ensures even distribution by using modulo operation.

```csharp
public T GetClient(scenarioInstanceNumber: int)
```

Getting client from ClientPool provides even distribution by using modulo operation: `ScenarioInfo.InstanceNumber % clientPool.Count`.

```csharp
var clientPool = new ClientPool<WebsocketClient>();

var scenario = Scenario.Create("scenario", async context => 
{
    var client = clientPool.GetClient(context.ScenarioInfo.InstanceNumber);

    // under the hood this method 'clientPool.GetClient' will execute:    
    // var index = ScenarioInfo.InstanceNumber % clientPool.Count;
    // return clientPool[index]; 
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/WebSockets/ClientPool/ClientPoolWebSocketsExample.cs).*

## Disposing clients from ClientPool

This method should be used to dispose of clients from the ClientPool. It ensures that ClientPool calls `Dispose()` on each client, provided the client implements the `IDisposable` interface.

```csharp
public void DisposeClients()
```

This method should be used to dispose a client from ClientPool using a custom dispose handler.

```csharp
public void DisposeClients(Action<T> disposeClient)
```

Disposing clients from ClientPool typically occurs during the [Scenario Clean](scenario#scenario-clean) phase.

```csharp
var clientPool = new ClientPool<WebsocketClient>();

var scenario = Scenario.Create("scenario", async context => 
{ 
    ...
})
.WithClean(async context =>
{
    // in this case ClientPool will execute client.Dispose() 
    // for each client if the client implement IDisposable
    clientPool.DisposeClients();

    // in this case ClientPool provides a custom dispose handler
    clientPool.DisposeClients(client => client.Disconnect().Wait());    
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/WebSockets/ClientPool/ClientPoolWebSocketsExample.cs).*