---
id: overview
title: Overview
sidebar_position: 1
hide_title: true
---

import NBomberStudioImage from './img/nbomber-studio.jpg'; 
import EmptyActiveSessionsImage from './img/empty-active-sessions.png'; 
import OneActiveSessionImage from './img/one-active-session.png'; 
import OpenedSessionImage from './img/opened-session.png'; 

<center><img src={NBomberStudioImage} width="100%" height="100%" /></center>

> 

## Overview

NBomber Studio - is a powerful management tool designed by NBomber for managing and interacting with NBomber load tests. The tool provides the following capabilities:

- Real-time data visibility - allows to monitor ongoing load tests while also analyzing historical test runs. Think of it as a native alternative to Grafana, specifically designed for NBomber load tests. 

- Running load tests in Kubernetes - enables to schedule and execute load tests in K8s. *This functionality is currently in development.*

:::info
You can use NBomber Studio together with your favorite observability platform (such as Datadog, Dynatrace, Grafana, etc.). NBomber supports streaming real-time metrics to multiple destinations in parallel.

```csharp
var stats = NBomberRunner
    .RegisterScenarios(scenario)        
    .WithReportingSinks(        
        new TimescaleDbSink(),   // stream metrics to TimescaleDB (NBomber Studio)
        new OpenTelemetrySink(), // stream metrics to OTEL
        new InfluxDBSink()       // stream metrics to InfluxDb
    )
    .Run();
```
:::

## License

:::info
NBomber Studio is FREE only for personal use. You can't use FREE version for an organization.

For organization usage, a minimum NBomber Business license is required.
:::