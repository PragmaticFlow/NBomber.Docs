---
id: postgres
title: Postgres
sidebar_position: 2
draft: true
---

## Quick Start

This section describes how to run YCSB on PostgreSQL and use it as a document store.

## 1. Start Postgres image in Docker

## 3. Set Up YCSB

Git clone YCSB and compile:

## 4. Provide Postgres Connection Parameters

Set host, port, database, user and password in the workload you plan to run.

- `postgres.host`
- `postgres.port`
- `postgres.database`
- `postgres.user`
- `postgres.password`

Set configs with the shell command, using the "-p" option before the connection parameters separated by " ":

```
run --workload A --recordcount 10000 --operationcount 50000 --zeropadding 5 --db postgres --insertorder 'ordered' -p postgres.host=localhost postgres.port=5432 postgres.database=mydb postgres.user=myuser postgres.password=mysecretpassword
```

## 5. Run tests