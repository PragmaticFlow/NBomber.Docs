---
id: config
title: Configuration
sidebar_position: 3
---

import StaticAuthImage from './img/static_auth.jpg'; 
import OauthAuthImage from './img/oauth_auth.jpg'; 

# Configuration

In this document, we outline the possible configuration options for NBomber Studio. 

## Config structure

NBomber provides a way to configure NBomber Studio through a JSON configuration file. You can override eather all settings or selectively. The following is an example of its structure:

```json
{
  "PostgreSql": {
    "ConnectionString": "Host=localhost;Port=5432;Username=timescaledb;Password=timescaledb;Database=nb_studio_db;Pooling=true;Maximum Pool Size=300;"
  },

  "Logger": {
    "MinimumLogLevel": "Information"
  },

  "Auth": {
    "Enabled": true,

    "JwtSecret": "{YOUR_SECRET}",    

    "StaticUserAuth": {
      "Users": [
        {
          "Email": "admin@admin",
          "Hash": "$2y$10$heuMG7aElXF5IiS4rCN49.T.smRQfhlCmVuoAh/SPpjQ6YA6qzZO6", // password is 'admin'
          "UserName": "admin"
        }
      ]
    }
  }  
}
```

## Passing configuration

There are several ways to pass configuration to NBomber Studio. Settings from later sources override earlier ones.

**Configuration loading order:**
1. External config files (via `--config` CLI argument)
2. Environment variables

### Using --config with Docker

Use the `--config` (or `-c`) command-line argument to pass one or more external JSON configuration files. Each file is merged on top of the base configuration, so you only need to specify the settings you want to override.

The `--config` argument can be specified multiple times to load multiple files. Files are applied in the order they are specified — later files override earlier ones.

```bash
# Single config file
--config /path/to/config.json

# Short form
-c /path/to/config.json

# Multiple config files (later files override earlier ones)
--config /path/to/base-config.json --config /path/to/secrets.json
```

To use the `--config` argument with Docker, mount your configuration file(s) into the container and pass the argument via the `command` directive:

```yaml
services:
  nbomber-studio:
    image: nbomberdocker/nbomber-studio:latest
    ports:
      - "5333:8080"
    volumes:
      - ./config.json:/app/config.json
    command: ["--config", "/app/config.json"]
```

You can also pass multiple config files:

```yaml
services:
  nbomber-studio:
    image: nbomberdocker/nbomber-studio:latest
    ports:
      - "5333:8080"
    volumes:
      - ./config.json:/app/config.json
      - ./secrets.json:/app/secrets.json
    command: ["--config", "/app/config.json", "--config", "/app/secrets.json"]
```

### Environment variable

As an alternative to `--config`, you can specify external config file paths via the `NBOMBER_STUDIO_CONFIG_FILE` environment variable. Multiple paths can be separated by a semicolon (`;`) on Windows or a colon (`:`) on Linux/Mac.

```yaml
services:
  nbomber-studio:
    image: nbomberdocker/nbomber-studio:latest
    ports:
      - "5333:8080"
    volumes:
      - ./config.json:/app/config.json
    environment:
      NBOMBER_STUDIO_CONFIG_FILE: "/app/config.json"
```