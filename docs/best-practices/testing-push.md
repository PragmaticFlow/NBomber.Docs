---
id: testing-push
title: How to test PUSH Scenarios
sidebar_position: 2
---

import PushImage from './img/how_to_test_push.jpeg';

<center><img src={PushImage} width="70%" height="70%" /></center>

Push-based communication is a messaging or event-driven model where data or events are "pushed" from a sender to one or more receivers without the receivers explicitly requesting the data. Usually, in push-based scenarios, it is common to expect to receive notifications through callbacks. In push-based scenarios, the callback function is triggered when new data or events are pushed to the recipient.

## PUSH with async callback
Let's consider a simple WebSockets example (*but it can be applied to any PUSH technology*) with a callback function that will be invoked when new data arrives:

```csharp
var client = new WebsocketClient(url);

await client.Connect();

await client.Send("message 1");

// highlight-start
client.MessageReceived.Subscribe(msg => Console.WriteLine(msg)); // callback function
// highlight-end

await client.Send("message 2");
```

For many years, **async callbacks** have been a standard way of defining/working with PUSH-based systems. The API style based on function callback has some limitations for load testing.  

Suppose that after executing the following code: `await client.Send("message 1")`, the server will receive our request and respond to us with a response message. And we need to wait on this response message to measure the latency of such an operation. The main issue with a callback function is that it breaks a sequential flow of execution, making it more challenging to measure latency for such function.

```csharp
await client.Send("message 1");

// this callback function breaks a sequential flow
// and we can't easily await a PUSH response message
client.MessageReceived.Subscribe(msg => Console.WriteLine(msg));
```

Ideally, we would like to express our flow in sequential way:

```csharp
await client.Send("message 1");

// here, we wait for response message from the server
await client.MessageReceived; 

await client.Send("message 2");
```

## Testing PUSH with NBomber
As mentioned in the previous section, async callbacks have some limitations for load testing. Let's look at an example to understand the issue better:

```csharp
var scenario = Scenario.Create("push_scenario", async ctx =>
{
    using var client = new WebsocketClient(url);

    var connect = await Step.Run("connect", ctx, async () =>
    {
        await client.Connect();
        return Response.Ok();
    });   

    var ping = await Step.Run("ping", ctx, async () =>
    {
        await client.Send("ping");
        return Response.Ok();
    });       

    var pong = await Step.Run("pong", ctx, async () =>
    {
        // this callback function breaks a sequential flow
        // and we can't easily await a PUSH response message
        client.MessageReceived.Subscribe(msg => Console.WriteLine(msg)); 

        return Response.Ok();
    });

    return Response.Ok();
});
```

As you can see, it's impossible to await a PUSH response from a server because of the nature of async callbacks.

Let's turn our PUSH flow (based on async callbacks) into a sequential flow. Converting it will let us smoothly integrate it into NBomber. For this, we will use [TaskCompletionSource](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.taskcompletionsource-1?view=net-7.0), which is a constructor to build an asynchronous operation you can await.

```csharp
var scenario = Scenario.Create("push_scenario", async ctx =>
{
    using var client = new WebsocketClient(url);

    // highlight-start
    var promise = new TaskCompletionSource<WebsocketMessage>();

    client.MessageReceived.Subscribe(msg => 
    {
        promise.TrySetResult(msg);        
    });
    // highlight-end

    var connect = await Step.Run("connect", ctx, async () =>
    {
        await client.Connect();
        return Response.Ok();
    });   

    var ping = await Step.Run("ping", ctx, async () =>
    {
        await client.Send("ping");
        return Response.Ok();
    });       

    var pong = await Step.Run("pong", ctx, async () =>
    {
        // here we are waiting on a PUSH response from the server
        // highlight-start
        var msg = await promise.Task;
        // highlight-end
        return Response.Ok();
    });

    return Response.Ok();
});
```

