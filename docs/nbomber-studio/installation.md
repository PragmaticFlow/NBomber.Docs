---
id: installation
title: Installation
sidebar_position: 2
---

import EmptyActiveSessionsImage from './img/empty-active-sessions.png'; 
import OneActiveSessionImage from './img/one-active-session.png'; 

On this page, you will learn how to install NBomber Studio in [Docker](#docker) and [Kubernetes](#kubernetes).

:::info
NBomber Studio is provided as a [Docker image](https://hub.docker.com/r/nbomberdocker/nbomber-studio) and requires a Postgres database (with the TimescaleDB extension) for storing metrics. [TimescaleDB](https://www.tigerdata.com/) is a Postgres extension for time series data. In our examples, we will use the [`timescaledb`](https://hub.docker.com/r/timescale/timescaledb) Docker image, which contains Postgres with TimescaleDB already installed. During the first run, TimescaleDB will run an auto-tune process to optimize Postgres for time-series workloads.
:::

## Docker

The simplest option for installing NBomber Studio is using Docker Compose. Below is an example of a `docker-compose.yaml` file that sets up both NBomber Studio and TimescaleDB.

```yaml title="docker-compose.yaml"
services:

    timescaledb:
        image: timescale/timescaledb:2.25.0-pg18-oss
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
            POSTGRESQL__CONNECTIONSTRING: "Host=timescaledb;Port=5432;Username=timescaledb;Password=timescaledb;Database=nb_studio_db;Pooling=true;"

volumes:
    nb_studio_data:
        driver: local

```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/NBomber_Studio).*

### Start NBomber Studio
To proceed with the installation, start NBomber Studio and its dependencies by running the following command inside the folder containing the `docker-compose.yaml` file:

```bash
docker compose up -d
```

## Kubernetes

:::info
Prerequisites
- Kubernetes 1.20+
- Helm 3+
:::

To install NBomber Studio in Kubernetes, we provide two Helm charts:
- [Timescale](https://artifacthub.io/packages/helm/timescale/timescale) - A Helm chart for deploying a single-node Timescale (OSS) instance to be used with NBomber Studio
- [NBomber Studio](https://artifacthub.io/packages/helm/nbomber-studio/nbomber-studio) - A Helm chart for NBomber Studio

### Installing Timescale

Add repository

```bash
helm repo add timescale https://pragmaticflow.github.io/nbomber-timescale-helm/
```

This chart deploys:

- A single-node TimescaleDB (OSS) StatefulSet
- A ClusterIP service for internal access
- Optional secret management for PostgreSQL credentials
- Persistent storage for database data
- It is designed for simplicity and can be used in development, testing, or production environments.

Install chart

This chart requires a Postgres password to be set. You can do this via CLI args or via a Secret. For production setups, use a Secret. In the following example, we will use CLI args for simplicity:

```bash
helm install nbomber-timescale timescale/timescale --set postgresql.password=timescaledb
```

:::info
By default, this installs a TimescaleDB instance with:
- timescaledb database
- timescaledb user
- 5Gi persistent volume
:::

For more detailed information about all available configuration options of this chart, please follow this link.

### Installing NBomber Studio

Add repository

```bash
helm repo add nbomber-studio https://pragmaticflow.github.io/nbomber-studio-helm/
```

This chart deploys:

- An NBomber Studio Deployment
- A ClusterIP service for internal access
- Optional ConfigMap and Secret for configuration overrides
- Optional Ingress resource for external HTTPS access
- It is designed for simplicity and can be used in development, testing, or production environments.

Install chart

This chart requires a Postgres password to connect to TimescaleDB. You can do this via CLI args or via a Secret. For production setups, use a Secret. In the following example, we will use CLI args for simplicity:

```bash
helm install nbomber-studio nbomber-studio/nbomber-studio \
  --set config.secret.enabled=true \
  --set "config.secret.data.PostgreSql.ConnectionString=Host=nbomber-timescale;Port=5432;Username=timescaledb;Password=timescaledb;Database=timescaledb;Pooling=true;Maximum Pool Size=300;"
```

For more detailed information about all available configuration options of this chart, please follow this link.