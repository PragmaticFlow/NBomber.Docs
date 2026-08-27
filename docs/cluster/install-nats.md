---
id: install-nats
title: Install NATS
sidebar_position: 1
---

:::info
Installation prerequisites

- [Docker](https://docs.docker.com/engine/install/) - If you decide to run NBomber Cluster, installing Docker and Docker Compose is required.
:::

To run NBomber Cluster, you need to install [NATS](https://nats.io/) message broker. The simple way is to use Docker for this. 

:::info
**Please, use NATS version 2.9.9**. NATS should be configured to use JetStream. In the `docker-compose.yaml` file, we enable JetStream on startup via `command: --js`. Also, a single-node NATS server is enough to run multiple NBomber Clusters in parallel.
:::

```yaml title="docker-compose.yaml"
version: "3.4"
services:

    nats:
        image: "nats:2.9.9"
        // highlight-start
        command: --js        
        // highlight-end
        ports:
            - "8222:8222"
            - "4222:4222"
```

Open the folder where the `docker-compose.yaml` file is located.

Start container.
```
docker compose up -d
```

Stop container.
```
docker compose down
```
