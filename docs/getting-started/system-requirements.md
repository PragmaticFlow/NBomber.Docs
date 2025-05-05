---
id: system-requirements
title: System Requirements
sidebar_position: 2
---

NBomber is built on the .NET runtime, which as you may know is fast and efficient: [part 1](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-5/), [part 2](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-6/), [part 3](https://devblogs.microsoft.com/dotnet/performance_improvements_in_net_7/), [part 4](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-8/), [part 5](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-9/). It uses the standard .NET threading model based on `System.Threading.Tasks`, enabling scalable parallelism to simulate thousands of concurrent users from a single node. Additionally, the NBomber engine is optimized to minimize pressure on the garbage collector through the use of memory pools and lightweight primitives that reduce memory allocations. We continuously focus on performance improvements to make NBomber one of the fastest load testing frameworks in its class.

## Hardware considerations

- Minimum Requirements:
    - CPU: 1-2 cores
    - RAM: 2-4 GB
    - Disk: Minimal (binaries < 50MB)
    - OS: Windows, macOS, Linux, Docker

- Recommended for High Load (> 5000 users):
    - CPU: 4–8 cores 
    - RAM: 8–16 GB+ (depends on script complexity)
    - Notes: Can be horizontally scaled using [Cluster](../cluster/overview)

When running a load test, ensure that the NBomber agent has at least 10-20% free RAM available.

## NBomber project settings

To optimize resource usage for measuring latency, we recommend using the [following settings](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Demo.csproj#L3-L9) for your load testing projects:

```xml
<PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>    
    <ServerGarbageCollection>false</ServerGarbageCollection>
    <ConcurrentGarbageCollection>true</ConcurrentGarbageCollection>
</PropertyGroup>
```

:::info
We recommend using .NET 8 or the latest available version for best performance and compatibility.

We disable Server GC in favor of using Workstation GC.
```xml
<ServerGarbageCollection>false</ServerGarbageCollection>
```

**Workstation GC** is designed for desktop applications to minimize the time spent in GC. In this case GC will happen more frequently but with shorter pauses in application threads. Server GC is optimized for application throughput in favor of longer GC pauses. 
:::
