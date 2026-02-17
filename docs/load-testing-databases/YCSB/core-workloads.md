---
id: core-workloads
title: Core Workloads
sidebar_position: 2
---

YCSB includes a set of core workloads that define a basic benchmark for cloud systems.

The core workloads consist of six different workloads:

### Workload A: Update heavy workload

This workload has a mix of 50/50 reads and updates. An application example is a session store recording recent actions. Updates in this workload do not presume you read the original record first. The assumption is all update writes contain fields for a record that already exists; oftentimes writing only a subset of the total fields for that record. Some data stores need to read the underlying record in order to reconcile what the final record should look like, but not all do.

### Workload B: Read mostly workload

This workload has a 95/5 reads/updates mix. Application example: photo tagging; add a tag is an update, but most operations are to read tags. As with Workload A, these writes do not presume you read the original record before writing to it.

### Workload C: Read only

This workload is 100% read. Application example: user profile cache, where profiles are constructed elsewhere.

### Workload D: Read latest workload

In this workload, new records are inserted, and the most recently inserted records are the most popular. Application example: user status updates; people want to read the latest.

### Workload E: Short ranges

In this workload, short ranges of records are queried, instead of individual records. Application example: threaded conversations, where each scan is for the posts in a given thread (assumed to be clustered by thread id).

<!-- ### Workload F: Read-modify-write

In this workload, the client will read a record, modify it, and write back the changes. Application example: user database, where user records are read and modified by the user or to record user activity. This workload forces a read of the record from the underlying datastore prior to writing an updated set of fields for that record. This effectively forces all datastores to read the underlying record prior to accepting a write for it. At the moment we use a random delta for the write rather than some value derived from the current record (say incrementing a counter). That can make the workload a bit harder to follow since the starting read seems unnecessary. -->

## Running the workloads

<!-- All six workloads have a data set which is similar. Workloads D and E insert records during the test run. Thus, to keep the database size consistent, we recommend the following sequence: -->
All five workloads have a data set which is similar. Workloads D and E insert records during the test run. Thus, to keep the database size consistent, we recommend the following sequence:

1. Load the database, using workload A's parameter file (workloads/workloada) but substituting the "load" command (run instead of load) for the "run" command.
2. Run workload A (using workloads/workloada and the "run" command).
3. Run workload B (using workloads/workloadb and the "run" command).
4. Run workload C (using workloads/workloadc and the "run" command).
<!-- 5. Run workload F (using workloads/workloadf and the "run" command). -->
5. Run workload D (using workloads/workloadd and the "run" command). This workload inserts records, increasing the size of the database.
6. Run workload E (using workloads/workloade and the "run" command). This workload inserts records, increasing the size of the database.