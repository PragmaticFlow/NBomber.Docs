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

## Overview

NBomber Studio is a management tool for monitoring and controlling NBomber load tests. It provides the following capabilities:

- **Real-time data visibility** — monitor ongoing load tests and analyze historical test runs. Think of it as a native alternative to Grafana, purpose-built for NBomber load tests.

- [**Managing, deploying, and running load tests in Kubernetes**](./loadtests-in-k8s/overview) — schedule and execute load tests in K8s directly from Studio.

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
NBomber Studio is FREE for personal use only. The FREE version cannot be used within an organization.

Organization use requires at minimum an NBomber Business license.
:::