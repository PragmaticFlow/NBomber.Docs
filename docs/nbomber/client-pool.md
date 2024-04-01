---
id: client-pool
title: Client Pool
sidebar_position: 8
---

import ClientPoolImage from './img/client-pool.jpeg';

<center><img src={ClientPoolImage} width="95%" height="95%" /></center>

Client Pool is an additional component that should be used for load tests that require reusing initialized clients (WebSockets, gRPC, Redis, etc.). There could be situations where you might need to reuse client instances with persistent connections. For example, you want to test a throughput of WebSockets API (or some database/message queue) for a hundred virtual users. Usually, such a target system requires you to open a persistent connection and reuse it for sending/receiving data through it. Your load test scenario shouldn't create and initialize a new client/connection for every turn. Instead, it should take a client/connection from a shared pool.

Let's look at these examples to understand the difference between creating a client for every turn vs. reusing a client from the client pool.

Creating a client for every turn:
```csharp
var scenario = Scenario.Create("scenario", async context =>
{
    using var client = new WebsocketClient(url);
    
    await client.Connect();

    await client.Send("message");

    await client.Disconnect();
});
```

Reusing a client from Client Pool:
```csharp
var scenario = Scenario.Create("scenario", async context =>
{
    var client = clientPool.GetClient(context.ScenarioInfo);

    await client.Send("message");    
});
```

## Initializing and populating Client Pool

This method should be used to add a client to ClientPool.

```csharp
public void AddClient(T client)
```

Client Pool initialization usually happens on the [Scenario Init](scenario#scenario-init) phase. 

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

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/ClientPool).*

## Getting clients from Client Pool

This method should be used to get a client from ClientPool.

```csharp
public T GetClient(ScenarioInfo scenarioInfo)
```

Getting clients from Client Pool works with a simple distribution rule: `scenarioInfo.ThreadNumber % clientPool.Count`

```csharp
var clientPool = new ClientPool<WebsocketClient>();

var scenario = Scenario.Create("scenario", async context => 
{ 
    var client = clientPool.GetClient(context.ScenarioInfo);

    // under the hood this method 'clientPool.GetClient' will execute:    
    // var index = scenarioInfo.ThreadNumber % clientPool.Count;
    // return clientPool[index]; 
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/ClientPool).*

## Disposing clients from Client Pool

This method should be used to dispose a client from ClientPool. With this method, ClientPool will execute client.Dispose() for each client if the client implement IDisposable interface.

```csharp
public void DisposeClients()
```

This method should be used to dispose a client from ClientPool using a custom dispose handler.

```csharp
public void DisposeClients(Action<T> disposeClient)
```

Disposing clients from Client Pool usually happens on the [Scenario Clean](scenario#scenario-clean) phase.

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

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/ClientPool).*