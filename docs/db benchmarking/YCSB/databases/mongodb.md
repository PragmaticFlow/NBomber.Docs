---
id: mongodb
title: Mongo DB
sidebar_position: 1
draft: true
---

## Quick Start

This section describes how to run YCSB on MongoDB.

## 1. Start Redis image in Docker

## 3. Set Up YCSB

Git clone YCSB and compile:

## 4. Provide Mongo DB Connection Parameters

Set url for mongodb you plan to run.

- `mongodb.host`
- `mongodb.port`

Set configs with the shell command, using the "-p" option before the connection parameters separated by ";":

```
run --workload B --recordcount 1000 --zeropadding 5 --db mongodb --insertorder 'ordered' -p mongodb.host=localhost mongodb.port=27017
```

## 5. Run tests