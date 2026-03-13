---
id: postgres
title: PostgreSQL
sidebar_position: 1
---

import StaticAuthImage from './img/static_auth.jpg'; 
import OauthAuthImage from './img/oauth_auth.jpg'; 

You can configure the connection string to PostgreSQL (TimescaleDB) via the following settings.

```json title="config.json"
{
    "PostgreSql": {
        "ConnectionString": "Host=timescaledb;Port=5432;Username=timescaledb;Password=timescaledb;Database=nb_studio_db;Pooling=true;Maximum Pool Size=300;"    
    },
}
```

:::info
Please check that your ConnectionString contains: `Pooling=true;Maximum Pool Size=300;`. It's an important setting that allows effectively handling database connections via a connection pool.
:::