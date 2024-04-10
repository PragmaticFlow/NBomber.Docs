---
id: mqtt
title: MQTT
sidebar_position: 2
---

import MqttImage from './img/mqtt.jpg';

<center><img src={MqttImage} width="70%" height="70%" /></center>

To work with MQTT protocol, NBomber provides [NBomber.MQTT](https://github.com/PragmaticFlow/NBomber.MQTT) plugin that includes sending requests and receiving responses with tracking of data transfer and status codes.

:::info
To install [NBomber.MQTT](https://github.com/PragmaticFlow/NBomber.MQTT) package you should execute the following *dotnet* command:

[![build](https://github.com/PragmaticFlow/NBomber.MQTT/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.MQTT)
[![NuGet](https://img.shields.io/nuget/v/nbomber.mqtt.svg)](https://www.nuget.org/packages/nbomber.mqtt/)

```code
dotnet add package NBomber.MQTT
```
:::

## MQTT API

MQTT plugin provides a wrapper over the popular library [MQTTnet](https://github.com/dotnet/MQTTnet). The wrapper implements basic methods to publish and receive messages.

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

NBomber MQTT plugin is basically a wrapper over the popular library [MQTTnet](https://github.com/dotnet/MQTTnet). If you need to work with the original *IMqttClient* from *MQTTnet* library, you can use public `Client` property.

```csharp
using var mqtt = new MqttClient(new MqttFactory().CreateMqttClient());

var originalClient = mqtt.Client;
```