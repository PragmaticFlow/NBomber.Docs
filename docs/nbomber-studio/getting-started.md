---
id: getting-started
title: Getting started
sidebar_position: 3
---

import StaticAuthImage from './config/img/static_auth.jpg'; 
import EmptyActiveSessionsImage from './img/empty-active-sessions.png'; 
import OneActiveSessionImage from './img/one-active-session.png'; 
import OpenedSessionImage from './img/opened-session.png'; 

On this page, we will learn how to start using NBomber Studio. We assume that Studio is already installed. If not, we recommend starting with the simplest installation using Docker.

### Start NBomber Studio in Docker
We need to start NBomber Studio and its dependencies by running the following command inside the folder with [docker-compose.yaml](./installation#docker) file:

```bash
docker compose up -d
```

After that, the dependencies should be up and running. Now, let's open a web browser and navigate to NBomber Studio, which is hosted locally (in Docker) and accessible at the following address:

```
http://localhost:5333
```

You should see this login form. 

<center><img src={StaticAuthImage} width="60%" height="60%" /></center>

:::info
By default, NBomber Studio installs with [**StaticUserAuth**](./config/auth#static-user-auth) enabled, and therefore you need to enter the default admin credentials.

```
email: admin@admin
password: admin
```
:::

After entering the credentials, you should be redirected to the Sessions page. You will see a dashboard displaying active sessions, which will initially be empty.

<center><img src={EmptyActiveSessionsImage} width="100%" height="100%" /></center>

### Run load test 
The next step is to run an NBomber load test, which will send metrics to TimescaleDB, allowing us to monitor them in NBomber Studio. To do this, let’s set up a basic test that writes data into TimescaleDB.

:::info
To write metrics into TimescaleDB, we’ll use the [NBomber Sink for Timescale](../reporting/realtime/timescale).
:::

The following is an example of a load test that writes data into TimescaleDB.

```csharp
var config = new TimescaleDbSinkConfig(connectionString: "YOUR CONNECTION STRING");
// highlight-start
var timescaleDb = new TimescaleDbSink(config);
// highlight-end

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
    .WithReportingSinks(timescaleDb)    
    // highlight-end
    .Run();
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/NBomber_Studio).*

After starting the scenario, you should see one active session appear. NBomber Studio automatically detects real-time data updates and refreshes the screen accordingly.

<center><img src={OneActiveSessionImage} width="100%" height="100%" /></center>

Now we can navigate to this session and analyze our real-time metrics. The dashboard will refresh according to the reporting interval specified in the load test.

<center><img src={OpenedSessionImage} width="100%" height="100%" /></center>