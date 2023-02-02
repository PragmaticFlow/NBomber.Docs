---
id: overview
title: Overview
sidebar_position: 0
---

import NBomberLogoImage from './img/nbomber_logo.png'; 

<center><img src={NBomberLogoImage} width="70%" height="70%" /></center>

[![build](https://github.com/PragmaticFlow/NBomber/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber/actions/workflows/build.yml)
[![NuGet](https://img.shields.io/nuget/v/nbomber.svg)](https://www.nuget.org/packages/nbomber/)
[![Gitter](https://badges.gitter.im/nbomber/community.svg)](https://gitter.im/nbomber/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

### What is NBomber?

NBomber is an open-source load testing tool that makes performance testing easy and productive for engineering teams. NBomber is free, developer-centric, and extensible.

Using NBomber, you can test the reliability and performance of your systems and catch performance regressions and problems earlier. NBomber will help you to build resilient and performant applications that scale.

### Why we build NBomber and what you can do with it?

1. The main reason behind NBomber is to provide a **lightweight** framework for writing load tests which you can use to test literally **any** system and simulate **any** production workload. We wanted to provide only a few abstractions so that we could describe any type of load and still have a simple, intuitive API. 
2. Another goal is to provide building blocks to validate your POC (proof of concept) projects by applying any complex load distribution.  
3. With NBomber you can test any PULL or PUSH system (HTTP, WebSockets, GraphQl, gRPC, SQL Databse, MongoDb, Redis etc). 
4. With NBomber **you can convert some of your integration tests to load tests easily**.

### Key features

- Zero dependencies on protocol (HTTP/WebSockets/AMQP/SQL) 
- Zero dependencies on semantic model (Pull/Push)
- Very flexible configuration and dead simple API (F#/C#/JSON)
- [Cluster support](nbomber-cluster)
- [Plugins support](plugins-overview)
- [Realtime reporting](reporting-overview)
- CI/CD integration
- [DataFeed support](general-concepts#datafeed)