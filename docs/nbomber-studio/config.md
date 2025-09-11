---
id: config
title: Configuration
sidebar_position: 2
---

import StaticAuthImage from './img/static_auth.jpg'; 
import OauthAuthImage from './img/oauth_auth.jpg'; 

In this document, we outline the possible configuration options for NBomber Studio.

## Configuration options

### Config JSON
NBomber provides a way to configure NBomber Studio through the `config.json` file. The following is an example of its structure:

```json title="config.json"
{
  "PostgreSql": {
    "ConnectionString": "Host=timescaledb;Port=5432;Username=timescaledb;Password=timescaledb;Database=nb_studio_db;Pooling=true;Maximum Pool Size=300;"
  },

  "Logger": {
    "MinimumLogLevel": "Warning"
  },

  "Auth": { ... }
}
```

To pass this file and override the default settings, use the path `./app/config.json`. Here is an example of a `docker-compose.yaml` file with this configuration mounted:

```yaml title="docker-compose.yaml"
services:

  nbomber-studio:
    image: nbomberdocker/nbomber-studio:latest    
    ports:
      - 80:8080
    volumes:
    // highlight-start
      - ./config.json:/app/config.json    
    // highlight-end
```

## Configuring SSO / Identity Providers

You can configure NBomber Studio to authenticate users for SSO using different identity providers.

### Static Users
For a quickstart or if you do not have an identity provider, you can configure NBomber Studio to use static users. 

:::info
NBomber Studio uses Bcrypt hashing for verification, so please use Bcrypt to hash your password. You can use any [online Bcrypt hash generator](https://bcrypt.online/) to do this.
:::

```json title="config.json"
"Auth": {

  "JwtSecret": "YOUR_SECRET_KEY",

  "StaticUserAuth": {
    "Users": [
      {
        "Email": "admin@admin",
        "Hash": "$2y$10$n5eGKWMMpJ.fbdix5QTU7.OJ.kBD7m82sbk6G9Lw3nPtYuVInUQBi", // bcrypt hash for password: admin
        "UserName": "admin"
      }
    ]
  }
}
```

After restarting the NBomber Studio with StaticUserAuth enabled, you will be redirected to the following login form.

<center><img src={StaticAuthImage} width="60%" height="60%" /></center>

### OIDC

To configure an `OIDC` provider, set the appropriate values in the `config.json` as shown in the Google example below.

:::info
Examples of OIDC providers include: Okta, Google, Salesforce, and Azure AD v2.
:::

```json title="config.json"
"Auth": {

  "JwtSecret": "YOUR_SECRET_KEY",

  "OpenIDConnect": {
    "Authority": "https://accounts.google.com",
    "ClientId": "YOUR_CLIENT_ID",
    "ClientSecret": "YOUR_CLIENT_SECRET",
    "CallbackPath": "/signin-oidc"
  }
}
```

After restarting the NBomber Studio with OIDC enabled, you will be redirected to the following login form.

<center><img src={OauthAuthImage} width="50%" height="50%" /></center>

If required, [Static Users](#static-users) can be enabled alongside [OpenID Connect](#oidc).

```json title="config.json"
"Auth": {

  "JwtSecret": "YOUR_SECRET_KEY",

  "StaticUserAuth": { ... },

  "OpenIDConnect": { ... }
}
```