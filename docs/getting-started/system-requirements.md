---
id: system-requirements
title: System Requirements
sidebar_position: 4
---

NBomber is built on the .NET runtime, which is known for being fast and efficient: [part 1](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-5/), [part 2](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-6/), [part 3](https://devblogs.microsoft.com/dotnet/performance_improvements_in_net_7/), [part 4](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-8/), [part 5](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-9/), [part 6](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-10/). It uses the standard .NET threading model based on `System.Threading.Tasks`, enabling scalable parallelism to simulate thousands of concurrent users from a single node. On top of that, the NBomber engine is optimized to minimize pressure on the garbage collector by using memory pools and lightweight primitives that reduce memory allocations. We continuously invest in performance improvements to keep NBomber one of the fastest load testing frameworks in its class.

In practice, this means you can generate serious load from a single laptop or a small CI runner — you usually don't need a cluster of machines to get started.

:::info
On a single node with 14 CPU cores and .NET 10, NBomber can typically handle approximately:
- **140,000 RPS** for HTTP/1.1 (with a 1 KB payload)

Actual numbers depend on your hardware, payload size, and scenario complexity. Before you trust your results, make sure the **load generator itself isn't the bottleneck** — if NBomber's node is maxing out CPU, your numbers reflect the client's limits, not your service's. Also make sure the service under test is scaled enough to handle this load.

You can run local [benchmarks](https://github.com/PragmaticFlow/LoadTestingToolsBench) in your environment to see the performance of NBomber and also compare with other popular load testing tools.
:::

## Supported platforms

NBomber runs anywhere .NET runs:

- **Operating systems:** Windows, macOS, Linux
- **Containers:** Docker (and any container orchestrator such as Kubernetes)
- **.NET version:** .NET 10 recommended. NBomber targets **.NET Standard 2.1**, so it runs on every .NET version starting from .NET Core 3.0/3.1.

## Important considerations

**Minimum requirements** (small tests, local development):

- **.NET version:** .NET 10
- **CPU:** 1–2 cores
- **RAM:** 1–2 GB

**Recommended for high load:**

- **.NET version:** .NET 10
- **CPU:** 4–8 cores
- **RAM:** 4–8 GB+ (depends on scenario complexity and payload size)
- **Scaling:** Can be scaled horizontally using [Cluster](../cluster/overview) when a single node is no longer enough

When running a load test, make sure the NBomber node has at least 10–20% free RAM available. If the load generator runs out of CPU or memory, your latency and throughput measurements become unreliable.

## NBomber project settings

To get accurate latency measurements and the best resource usage, we recommend the [following settings](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Demo.csproj#L3-L9) for your load testing projects:

```xml
<PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>    
    <ServerGarbageCollection>true</ServerGarbageCollection>
    <ConcurrentGarbageCollection>true</ConcurrentGarbageCollection>
</PropertyGroup>
```

:::info
**Why these settings?**

- **`.NET 10` (or the latest available version)** — each release brings meaningful performance and compatibility improvements.
- **`ServerGarbageCollection`** — enables Server GC, which uses multiple threads and is tuned for high-throughput, multi-core workloads like load testing.
- **`ConcurrentGarbageCollection`** — lets garbage collection run concurrently with your test, reducing pauses that would otherwise distort latency measurements.
:::
