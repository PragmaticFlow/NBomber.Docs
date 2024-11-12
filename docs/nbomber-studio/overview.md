---
id: overview
title: Overview
sidebar_position: 1
hide_title: true
---

import NBomberStudioImage from './img/nbomber-studio-logo.png'; 
import HistoryImage from './img/history.png'; 
import EmptyActiveSessionsImage from './img/empty-active-sessions.png'; 
import OneActiveSessionImage from './img/one-active-session.png'; 
import OpenedSessionImage from './img/opened-session.png'; 

<center><img src={NBomberStudioImage} width="90%" height="90%" /></center>

<center><img src={HistoryImage} width="100%" height="100%" /></center>

## Overview

NBomber Studio - is a powerful management tool designed by NBomber for managing and interacting with NBomber load tests. The tool provides the following capabilities:

- Real-time data visibility - allows to monitor ongoing load tests while also analyzing historical test runs. Think of it as a native alternative to Grafana, specifically designed for NBomber load tests. 

- Running load tests in the cloud - enables to schedule and execute load tests in popular cloud environments (AWS, Azure, Google Cloud, Digital Ocean). *This functionality is currently in development.*

## License

:::info
NBomber Studio is FREE only for personal use. You can't use FREE version for an organization.

For organization usage, a minimum NBomber Business license is required.
:::

## Installation

NBomber Studio is provided as a [Docker image](https://hub.docker.com/r/nbomberdocker/nbomber-studio) and requires a PostgreSQL database with the TimescaleDB extension. Below is an example of a Docker compose file that sets up both NBomber Studio and TimescaleDB.

```yaml title="docker-compose.yaml"
services:

    timescaledb:
        image: timescale/timescaledb:2.14.2-pg16
        command: postgres -c 'max_connections=500'
        restart: always
        ports:
            - "5432:5432"
        volumes:
            - nb_studio_data:/var/lib/postgresql/data
        environment:
            POSTGRES_DB: nb_studio_db
            POSTGRES_USER: timescaledb
            POSTGRES_PASSWORD: timescaledb
        healthcheck:
            test: [ "CMD-SHELL", "pg_isready -d 'user=timescaledb dbname=nb_studio_db'" ]
            interval: 5s
            timeout: 10s
            retries: 5
            start_period: 5s

    nbomber-studio:
        // highlight-start
        image: nbomberdocker/nbomber-studio:latest
        // highlight-end
        ports:
            - "5333:8080"
        depends_on:
            timescaledb:
                condition: service_healthy
        environment:
            DBSETTINGS:CONNECTIONSTRING: "Host=timescaledb;Port=5432;Username=timescaledb;Password=timescaledb;Database=nb_studio_db;Pooling=true;"

volumes:
    nb_studio_data:
        driver: local

```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/NBomber_Studio).*

:::info
For production use, it’s important to specify the exact version of the NBomber Studio image rather than using `latest`.

```
image: nbomberdocker/nbomber-studio:0.1.0
```
:::

### Spin up NBomber Studio
To proceed with the installation, we need to start NBomber Studio and its dependencies by running the following command inside the folder with `docker-compose.yaml` file:

```bash
docker compose up -d
```

After that, the dependencies should be up and running. Now, let's open web browser and navigate to NBomber Studio, which is hosted locally (in Docker) and accessible at the following address:

```
http://localhost:5333
```

You will see a dashboard displaying active sessions, which will initially be empty.

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

Now, we can navigate to this session and analyze our real-time metrics. The dashboard will refresh according to the reporting interval specified in the load test.

<center><img src={OpenedSessionImage} width="100%" height="100%" /></center>