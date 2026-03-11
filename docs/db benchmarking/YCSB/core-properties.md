---
id: core-properties
title: Core Properties
sidebar_position: 3
draft: true
---

## Core YCSB properties

All workload files can specify the following properties:

- **workload**: workload class to use
- **recordcount**: the number of records in the dataset at the start of the workload. used when loading for all workloads. (default: 1000)
- **operationcount**: the number of operations to perform in the workload (default: 1000)
- **db**: database class to use. Alternatively this may be specified on the command line.
- **exportfile**: path to a file where output should be written instead of to stdout (default: undefined/write to stdout)
- **threadcount**: number of YCSB client threads. Alternatively this may be specified on the command line. (default: 1)

## Core workload package properties

The property files used with the core workload generator can specify values for the following properties:

- **fieldcount**: the number of fields in a record (default: 10)
- **fieldlength**: the size of each field (default: 100)
<!-- - **minfieldlength**: the minimum size of each field (default: 1) -->
- **readallfields**: should reads read all fields (true) or just one (false) (default: true)
- **writeallfields**: should updates and read/modify/writes update all fields (true) or just one (false) (default: false)
<!-- - **readproportion**: what proportion of operations should be reads (default: 0.95) -->
<!-- - **updateproportion**: what proportion of operations should be updates (default: 0.05) -->
<!-- - **insertproportion**: what proportion of operations should be inserts (default: 0) -->
<!-- - **scanproportion**: what proportion of operations should be scans (default: 0) -->
<!-- - **readmodifywriteproportion**: what proportion of operations should be read a record, modify it, write it back (default: 0) -->
<!-- - **requestdistribution**: what distribution should be used to select the records to operate on – uniform, zipfian, hotspot, sequential, exponential or latest (default: uniform) -->
<!-- - **minscanlength**: for scans, what is the minimum number of records to scan (default: 1) -->
<!-- - **maxscanlength**: for scans, what is the maximum number of records to scan (default: 1000) -->
<!-- - **scanlengthdistribution**: for scans, what distribution should be used to choose the number of records to scan, for each scan, between 1 and maxscanlength (default: uniform) -->
<!-- - **insertstart**: for parallel loads and runs, defines the starting record for this YCSB instance (default: 0) -->
<!-- - **insertcount**: for parallel loads and runs, defines the number of records for this YCSB instance (default: recordcount) -->
- **zeropadding**: for generating a record sequence compatible with string sort order by 0 padding the record number. Controls the number of 0s to use for padding. (default: 1) For example for row 5, with zeropadding=1 you get 'user5' key and with zeropadding=8 you get 'user00000005' key. In order to see its impact, zeropadding needs to be bigger than number of digits in the record number.
- **insertorder**: should records be inserted in order by key ("ordered"), or in hashed order ("hashed") (default: hashed)
<!-- - **fieldnameprefix**: what should be a prefix for field names, the shorter may decrease the required storage size (default: "field") -->

