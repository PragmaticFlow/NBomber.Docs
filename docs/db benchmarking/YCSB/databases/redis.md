---
id: redis
title: Redis
sidebar_position: 0
draft: true
---
## Quick Start

This section describes how to run YCSB on Redis.

## 1. Start Redis image in Docker

## 3. Set Up YCSB

Git clone YCSB and compile:

## 4. Provide Redis Connection Parameters

Set host, port, password in the workload you plan to run.

- `redis.host`
- `redis.port`
- `redis.password`
  - Don't set the password if redis auth is disabled.

Set configs with the shell command, using the "-p" option before the connection parameters separated by " ":

```
run --workload E --recordcount 1000 --db redis -p redis.host=localhost redis.port=6379
```

## 5. Run tests
