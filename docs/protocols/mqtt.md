---
id: mqtt
title: MQTT
sidebar_position: 2
---

import MqttImage from './img/mqtt.jpg';

<center><img src={MqttImage} width="70%" height="70%" /></center>

MQTT is a standard messaging protocol for the Internet of Things (IoT). It is designed as an extremely lightweight publish/subscribe messaging transport that is ideal for connecting remote devices with a small code footprint and minimal network bandwidth. MQTT today is used in a wide variety of industries, such as automotive, manufacturing, telecommunications, oil and gas, etc.

To work with MQTT protocol, NBomber provides [NBomber.MQTT](https://github.com/PragmaticFlow/NBomber.MQTT) plugin that includes functionality for sending and receiving messages, including tracking of data transfer and status codes.

:::info
To install [NBomber.MQTT](https://github.com/PragmaticFlow/NBomber.MQTT) package you should execute the following *dotnet* command:

[![build](https://github.com/PragmaticFlow/NBomber.MQTT/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.MQTT)
[![NuGet](https://img.shields.io/nuget/v/nbomber.mqtt.svg)](https://www.nuget.org/packages/nbomber.mqtt/)

```code
dotnet add package NBomber.MQTT
```
:::

## MQTT API

MQTT plugin provides a wrapper over the popular library [MQTTnet](https://github.com/dotnet/MQTTnet). The wrapper implements basic methods for publishing and receiving messages.

```csharp
var payload = Data.GenerateRandomBytes(200);

var scenario = Scenario.Create("mqtt_scenario", async ctx =>
{
    using var client = new MqttClient(new MqttFactory().CreateMqttClient());    
    
    var topic = $"/clients/{ctx.ScenarioInfo.InstanceId}";

    var connect = await Step.Run("connect", ctx, async () =>
    {
        var clientOptions = new MqttClientOptionsBuilder()
            .WithTcpServer("localhost")
            // .WithWebSocketServer(options => options.WithUri("ws://localhost:8083/mqtt"))
            .WithCleanSession()
            .WithClientId($"client_{ctx.ScenarioInfo.InstanceId}")
            .Build();

        var response = await client.Connect(clientOptions);
        return response;
    });

    var subscribe = await Step.Run("subscribe", ctx, () => client.Subscribe(topic));

    var publish = await Step.Run("publish", ctx, async () =>
    {
        var msg = new MqttApplicationMessageBuilder()
            .WithTopic(topic)
            .WithPayload(payload)
            .Build();

        var response = await client.Publish(msg);
        return response;
    });

    var receive = await Step.Run("receive", ctx, async () =>
    {
        var response = await client.Receive();
        return response;
    });

    var disconnect = await Step.Run("disconnect", ctx, () => client.Disconnect());

    return Response.Ok();
});
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/MQTT/PingPongMqttTest.cs).*

### Original IMqttClient

NBomber MQTT plugin is basically a wrapper over the popular library [MQTTnet](https://github.com/dotnet/MQTTnet). If you need to work with the original *IMqttClient* from *MQTTnet* library, you can use public `Client` property. All native methods are available for usage.

```csharp
using var mqtt = new MqttClient(new MqttFactory().CreateMqttClient());

// highlight-start
var originalClient = mqtt.Client;
// highlight-end
```