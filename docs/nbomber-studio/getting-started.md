---
id: getting-started
title: Getting started
sidebar_position: 3
---

import StaticAuthImage from './config/img/static_auth.jpg'; 
import EmptyActiveSessionsImage from './img/empty-active-sessions.png'; 
import OneActiveSessionImage from './img/one-active-session.png'; 
import OpenedSessionImage from './img/opened-session.png'; 

This page covers how to get started with NBomber Studio.

:::info
We assume that NBomber Studio is already installed and working. 
If not, we recommend starting with the [simplest installation using Docker](./installation#docker).
:::

## Run load test 
Let's try to run NBomber load test, which will send metrics to TimescaleDB, allowing us to see them in NBomber Studio. For this, let’s set up a basic test that writes data into TimescaleDB.

:::info
To write metrics into TimescaleDB, we’ll use the [NBomber Sink for Timescale](../reporting/realtime/timescale).
:::

The following is an example of a load test that writes data into TimescaleDB.

```csharp
var scenario = Scenario.Create("user_flow_scenario", async context =>
{    
    ...    
})
.WithLoadSimulations(    
    Simulation.Inject(rate: 200, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(30))
);

NBomberRunner
    .RegisterScenarios(scenario)    
    // highlight-start
    .WithReportingSinks(
        new TimescaleDbSink(new TimescaleDbSinkConfig(connectionString: "YOUR CONNECTION STRING"))
    )    
    // highlight-end
    .Run();
```

*You can find the complete example at this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/NBomber_Studio).*

After starting the scenario, you should see one active session appear. NBomber Studio automatically detects real-time data updates and refreshes the screen accordingly.

<center><img src={OneActiveSessionImage} width="100%" height="100%" /></center>

Now we can navigate to this session and analyze our real-time metrics. The dashboard will refresh according to the reporting interval specified in the load test.

<center><img src={OpenedSessionImage} width="100%" height="100%" /></center>