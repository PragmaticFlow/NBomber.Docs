---
id: amqp
title: AMQP
sidebar_position: 4
---

import AmqpImage from './img/amqp.jpg';
import AmqpClientPoolImage from './img/amqp_client_pool.jpg';
import AmqpIndependentActorsImage from './img/amqp_independent_actors.jpg';

<center><img src={AmqpImage} width="70%" height="70%" /></center>

AMQP (Advanced Message Queuing Protocol) is an open standard for messaging middleware that enables applications to communicate with each other by sending messages in a reliable and interoperable way. It is a protocol designed to provide a robust messaging infrastructure for distributed systems, enabling asynchronous communication between different components.

To work with AMQP protocol, NBomber provides [NBomber.AMQP](https://github.com/PragmaticFlow/NBomber.AMQP) plugin that includes functionality for sending and receiving messages, including tracking of data transfer and status codes.

:::warning
This package is experimental and might be subject to breaking API changes in the future. While we intend to keep experimental packages as stable as possible, we may need to introduce breaking changes.
:::

:::info
To install [NBomber.AMQP](https://github.com/PragmaticFlow/NBomber.AMQP) package you should execute the following *dotnet* command:

[![build](https://github.com/PragmaticFlow/NBomber.AMQP/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.AMQP)
[![NuGet](https://img.shields.io/nuget/v/nbomber.amqp.svg)](https://www.nuget.org/packages/nbomber.amqp/)

```code
dotnet add package NBomber.AMQP
```
:::

## AMQP API

AMQP plugin provides a wrapper over the popular library [RabbitMQ.Client](https://www.rabbitmq.com/client-libraries/dotnet). The wrapper implements basic methods for publishing and receiving messages.

```csharp
var scenario = Scenario.Create("amqp_scenario", async ctx =>
{
    using var amqpClient = new AmqpClient(channel);

    // Declares an AMQP exchange and queue, then binds the queue to the exchange using the specified routing key.
    await amqpClient.DeclareQueue(exchange: "myExchange", exchangeType: ExchangeType.Direct, queue: queueName, routingKey: queueName);

    // Subscribes to the specified AMQP queue by adding a consumer.
    await amqpClient.Subscribe(queue: "queueName"); 

    // Publishes a message to the specified AMQP exchange using the given routing key.
    await amqpClient.Publish(exchange: "myExchange", routingKey: "routingKey", body: payload);

    // Awaits and receives a message from the subscribed queue.
    var response = await amqpClient.Receive();

    // Disconnect the current client from the broker
    await amqpClient.Disconnect();

    // Gets the total number of messages received by the client.
    var receivedCount = amqpClient.MsgReceivedCount

    return Response.Ok();
});
```

### Original RabbitMQ.Client

NBomber AMQP plugin is basically a wrapper over the popular library [RabbitMQ.Client](https://www.rabbitmq.com/client-libraries/dotnet). If you need to work with the original *API* from *RabbitMQ.Client* library, you can use public `AmqpChannel` property. All native methods are available for usage.

```csharp
using var client = new AmqpClient(channel);

var originalClient = client.AmqpChannel;

await originalClient.ExchangeDeclareAsync(exchange: "myExchange", type: ExchangeType.Direct);
```

## Examples
Here you will find some useful examples of working with the AMQP protocol and NBomber to cover different workloads.

### Ping Pong Example
This is a basic example meant to demonstrate the API usage. In this example, we create an AMQP client that:

1. Connects to the broker
2. Subscribes to its own queue (self topic) using the scenario instance ID (ctx.ScenarioInfo.InstanceId)
3. Publishes a message to self topic
4. Awaits and receives a message from the self topic
5. Disconnects

```csharp
var payload = Data.GenerateRandomBytes(200);
var factory = new ConnectionFactory { HostName = "localhost" };

var scenario = Scenario.Create("ping_pong_scenario", async ctx =>
{
    var connect = await Step.Run("connect", ctx, async () =>
    {
        var connection = await factory.CreateConnectionAsync();
        var channel = await connection.CreateChannelAsync();

        var amqpClient = new AmqpClient(channel);
        return Response.Ok(payload: amqpClient);
    });

    using var amqpClient = connect.Payload.Value;

    var subscribe = await Step.Run("subscribe", ctx, async () =>
    {
        var queueName = ctx.ScenarioInfo.InstanceId;

        await amqpClient.DeclareQueue(exchange: "myExchange", exchangeType: ExchangeType.Direct, queue: queueName,
            routingKey: queueName);

        return await amqpClient.Subscribe(queue: queueName, autoAck: true);
    });

    var publish = await Step.Run("publish", ctx, async () =>
    {
        var queueName = ctx.ScenarioInfo.InstanceId;
        return await amqpClient.Publish(exchange: "myExchange", routingKey: queueName, body: payload);
    });

    var receive = await Step.Run("receive", ctx, async () =>
    {
        // pass the ScenarioCancellationToken to stop waiting for a response if the scenario finish event is triggered
        var response = await amqpClient.Receive(ctx.ScenarioCancellationToken);
        return response;
    });

    var disconnect = await Step.Run("disconnect", ctx, async () =>
    {
        await amqpClient.Disconnect();
        return Response.Ok();
    });

    return Response.Ok();
})
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/AMQP/PingPongAmqpTest.cs).*

### ClientPool Example

<center><img src={AmqpClientPoolImage} width="70%" height="70%" /></center>

In this example, we create and initialize a list of AMQP clients, which remain active throughout the entire load test using a [ClientPool](../nbomber/client-pool) abstraction. Each client continuously and sequentially performs two steps:
- **publishes a message** to self topic
- **receives a message** from the self topic

All clients run in parallel to simulate multiple connected clients. This test measures how active concurrent connections impact the performance of the message broker. Also it measures both the throughput and latency for publish and receive operations.

```csharp
// Create a ClientPool, which will be used to hold active AMQP connections/clients
var clientPool = new ClientPool<AmqpClient>();

byte[] message = [];
var usePersistence = false;

var scenario = Scenario.Create("client_pool_scenario", async ctx =>
{
    // get a client from the pool by Scenario InstanceNumber
    // highlight-start
    var client = clientPool.GetClient(ctx.ScenarioInfo);
    // highlight-end
    
    var publish = await Step.Run("publish", ctx, async () =>
    {
        var queueName = $"queue_{ctx.ScenarioInfo.InstanceNumber}";
        var props = new BasicProperties { Persistent = usePersistence };

        var response = await client.Publish(exchange: "myExchange", routingKey: queueName, props, message);
        return response;
    });

    var receive = await Step.Run("receive", ctx, async () =>
    {
        // pass the ScenarioCancellationToken to stop waiting for a response if the scenario finish event is triggered
        var response = await client.Receive(ctx.ScenarioCancellationToken);
        return response;
    });    

    return Response.Ok();
})
.WithInit(async context =>
{    
    var config = context.CustomSettings.Get<CustomScenarioSettings>();

    for (var i = 0; i < config.ClientCount; i++)
    {
        // initialize a client and add it to the ClientPool 
        var connection = await factory.CreateConnectionAsync();
        var channel = await connection.CreateChannelAsync();
        var amqpClient = new AmqpClient(channel);

        var queueName = $"queue_{i}";

        var result = await amqpClient.DeclareQueue(exchange: "myExchange", exchangeType: ExchangeType.Direct, 
            queue: queueName, routingKey: queueName, durable: usePersistence);

        if (!result.IsError)
        {
            await amqpClient.Subscribe(queue: queueName);
            // highlight-start
            clientPool.AddClient(amqpClient);
            // highlight-end
        }
        else
            throw new Exception("client can't connect to the AMQP broker");        
    }
})
.WithClean(ctx =>
{
    clientPool.DisposeClients(client => client.Dispose());
    return Task.CompletedTask;
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/AMQP/ClientPool/ClientPoolAmqpExample.cs).*

### Independent Actors Example

<center><img src={AmqpIndependentActorsImage} width="100%" height="100%" /></center>

There could be situations where you have an independent Publisher/Writer and Consumer/Reader, each working separately. In such cases, you may want to measure both the throughput and the message latency from the publisher to the consumer. 

This particular case is usually tricky to cover with any load testing framework.
> Imagine two messages being published by two independent publishers **at the same time**, say at `"00:00:10"`. The consumer waits to receive the messages — the first received message will have its latency measured correctly, **but the second message will be processed immediately after the first one**. This will distort the latency measurement for the second message, making it appear as if there was zero delay.

Example: 

```csharp
// It's a pseudo-code just to show how Publisher and Consumer scenarios could be modeled.
// Publisher: sends messages to a topic
var publish_scenario = Scenario.Create("publish_scenario", async ctx =>
{
    var payload = Data.GenerateRandomBytes(200);
    var prop = new BasicProperties();

    return await amqpClient.Publish(exchange: "myExchange", routingKey: "myRoutingKey", prop, payload);    
})
.WithLoadSimulations(    
    // we run 2 Publisher(s), which will send messages concurrently
    // highlight-start
    Simulation.KeepConstant(2, TimeSpan.FromSeconds(30)) 
    // highlight-end
);

// Consumer: listens for messages and measures latency
var consume_scenario = Scenario.Create("consume_scenario", async ctx =>
{
    var message = await amqpClient.Receive(); // The second message will be received immediately after the first one,
                                              // because both messages were published at the same time. 
                                              // This will distort the latency measurement for the second message,
    return Response.Ok();                     // making it appear as if there was zero delay                                               
})
.WithLoadSimulations(    
    // we run 1 Consumer
    // highlight-start
    Simulation.KeepConstant(1, TimeSpan.FromSeconds(30)) 
    // highlight-end
);

NBomberRunner
    .RegisterScenarios(publish_scenario, consume_scenario)
    .Run();
```

:::info
In order to fix this measurement, we need to do a few things:
- On the Publisher side: each message should be enriched with a current `timestamp`.
- On the Consumer side: we read the received message's `timestamp` and calculate the latency: 
```csharp
var customLatency = DateTime.UtcNow - msg.Timestamp
```
- We instruct NBomber to use the custom latency via `Response.Ok(customLatency: value)`
:::

Example: 

```csharp
var publish_scenario = Scenario.Create("publish_scenario", async ctx =>
{    
    // highlight-start
    var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    // highlight-end

    var props = new BasicProperties
    {
        // We include the current timestamp so the consumer can calculate the final latency.
        Headers = new Dictionary<string, object> { { "timestamp", timestamp } }
    };

    return await amqpClient.Publish(exchange: "myExchange", routingKey: "myRoutingKey", props, payload);    
})
.WithLoadSimulations(        
    Simulation.KeepConstant(2, TimeSpan.FromSeconds(30))     
);

var consume_scenario = Scenario.Create("consume_scenario", async ctx =>
{
    var message = await amqpClient.Receive(ctx.ScenarioCancellationToken);

    // Final latency is computed by subtracting the current time from the timestamp in the header.
    var timestampMs = (long)message.Payload.Value.BasicProperties.Headers["timestamp"];
    var latency = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - timestampMs;

    // highlight-start
    return Response.Ok(customLatencyMs: latency, sizeBytes: message.SizeBytes);                                              
    // highlight-end
})
.WithLoadSimulations(        
    Simulation.KeepConstant(1, TimeSpan.FromSeconds(30))     
);

NBomberRunner
    .RegisterScenarios(publish_scenario, consume_scenario)
    .Run();
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/AMQP/IndependentActors).*