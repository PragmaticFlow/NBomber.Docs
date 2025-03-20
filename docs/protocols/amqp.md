---
id: amqp
title: AMQP
sidebar_position: 4
---

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
var payload = Data.GenerateRandomBytes(200);

var factory = new ConnectionFactory { HostName = "localhost" };
using var connection = await factory.CreateConnectionAsync();
using var channel = await connection.CreateChannelAsync();

var scenario = Scenario.Create("ping_pong_amqp_scenario", async ctx =>
    {
        var amqpClient = new AmqpClient(channel);
        var prop = new BasicProperties();
        var scenarioInstanceId = ctx.ScenarioInfo.InstanceId;

        await amqpClient.Channel.ExchangeDeclareAsync(exchange: "myExchange", type: ExchangeType.Direct);
        await amqpClient.Channel.QueueDeclareAsync(queue: scenarioInstanceId, durable: false, exclusive: false, autoDelete: false);                           

        await amqpClient.Channel.QueueBindAsync(queue: scenarioInstanceId, exchange: "myExchange", 
            routingKey: scenarioInstanceId);
        
        amqpClient.AddConsumer(queue: scenarioInstanceId, autoAck: true);
        
        var publish = Step.Run("publish", ctx, async () =>
        {
            return amqpClient.Publish(exchange: "myExchange", routingKey: scenarioInstanceId, prop, body: payload);
        });

        var receive = Step.Run("receive", ctx, () =>
        {
            return amqpClient.Receive().AsTask();
        });
        
        return Response.Ok();
    });
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber.AMQP/blob/dev/examples/Demo/Program.cs).*

### Original RabbitMQ.Client

NBomber AMQP plugin is basically a wrapper over the popular library [RabbitMQ.Client](https://www.rabbitmq.com/client-libraries/dotnet). If you need to work with the original *channel* from *RabbitMQ.Client* library, you can use public `Channel` property. All native methods are available for usage.

```csharp
var factory = new ConnectionFactory { HostName = "localhost" };
using var connection = await factory.CreateConnectionAsync();
using var channel = await connection.CreateChannelAsync();
var amqpClient = new AmqpClient(channel);

// highlight-start
await amqpClient.Channel.ExchangeDeclareAsync(exchange: "myExchange", type: ExchangeType.Direct);
// highlight-end
```