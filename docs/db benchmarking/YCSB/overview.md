---
id: overview
title: Overview
sidebar_position: 1
hide_title: true
draft: true
---

import YcsbImage from './img/nbomber_ycsb.jpg';

<center><img src={YcsbImage} width="80%" height="80%" /></center>

The **Yahoo! Cloud Serving Benchmark (YCSB)** is an open-source database benchmarking suite and a critical analytical component of cloud-based database management system (DBMS) evaluation. It allows users to comparatively measure how various modern SQL and NoSQL DBMS perform simple database operations on generated datasets.

The original benchmark was developed by workers in the research division of Yahoo! who released it in 2010 with the stated goal of "facilitating performance comparisons of the new generation of cloud data serving systems", particularly for transaction-processing workloads which differed from ones measured by benchmarks designed for more traditional database management systems.

The strength of YCSB benchmarks is that they can be used to compare databases that are architecturally distinct and measure the way various database configurations perform under different workloads.

The YCSB framework also automates or simplifies essential benchmarking process tasks such as:
- Defining core workloads with essential parameters
- Connecting to the database with the database drivers
- Executing the workload on the database
- Collecting and storing performance data
- Creating a new interface layer for benchmarking

## Core workloads

YCSB includes a set of core workloads that define a basic benchmark for cloud systems.

The core workloads consist of six different workloads:

| Workload | Name | Operations | Description |
|----------|------|------------|-------------|
| **A** | Update heavy | 50% reads, 50% updates | Application example: session store recording recent actions. Updates do not presume you read the original record first. The assumption is all update writes contain fields for a record that already exists; oftentimes writing only a subset of the total fields for that record. Some data stores need to read the underlying record in order to reconcile what the final record should look like, but not all do. |
| **B** | Read mostly | 95% reads, 5% updates | Application example: photo tagging; add a tag is an update, but most operations are to read tags. As with Workload A, these writes do not presume you read the original record before writing to it. |
| **C** | Read only | 100% reads | Application example: user profile cache, where profiles are constructed elsewhere. |
| **D** | Read latest | Reads and inserts, most recent records are most popular | New records are inserted, and the most recently inserted records are the most popular. Application example: user status updates; people want to read the latest. |
| **E** | Short ranges | Short range scans instead of individual record reads | Short ranges of records are queried, instead of individual records. Application example: threaded conversations, where each scan is for the posts in a given thread (assumed to be clustered by thread id). |
| **F** | Read-modify-write | Reads, modifies, and writes back changes | The client will read a record, modify it, and write back the changes. Application example: user database, where user records are read and modified by the user or to record user activity. This workload forces a read of the record from the underlying datastore prior to writing an updated set of fields for that record, effectively forcing all datastores to read the underlying record prior to accepting a write for it. |