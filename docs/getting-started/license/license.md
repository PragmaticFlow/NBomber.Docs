---
id: license
title: License
sidebar_position: 7
---

:::info
NBomber and NBomber Studio are FREE for personal and academic use. NBomber is not free for organizational use.

- Personal use includes: personal or hobby projects, benchmarks, tutorials, educational or review content, including monetized content (such as blogs or videos)

- Academic use includes: 
  - students using NBomber for coursework, assignments, theses, dissertations, or doctoral research;
  - educators using NBomber for teaching, lectures, classroom, demonstrations, or course materials;
  - researchers using NBomber for non-commercial academic research and for publishing results in papers, articles, or presentations.

For more information, see section 2.6 of the [NBomber License Agreement (PDF)](https://nbomber.com/assets/NBOMBER-LICENSE-AGREEMENT-3.2.pdf).
:::

For organizational use, NBomber offers two types of licenses. Each license is issued per organization and can be shared by all members of your company.

- **Business license** — Allows the use of NBomber and [NBomber Studio](../../nbomber-studio/overview) within your organization.
- **Enterprise license** — Allows the use of NBomber and [NBomber Studio](../../nbomber-studio/overview) within your organization, and additionally provides access to:
  - [NBomber Cluster](../../cluster/overview)
  - [NBomber Studio's Kubernetes integration](../../nbomber-studio/loadtests-in-k8s/overview)
  - [NBomber Studio's Load Test Schedules](../../nbomber-studio/features/schedules)

:::tip
If you're interested in experimenting with NBomber Cluster but do not have an enterprise license, you can use of the [Local Dev Cluster](../../cluster/local-dev-cluster).
:::

## Frequently asked questions

| Question | Answer | 
| - | - |
| Is your license priced for the entire company, or is it based on a per-developer seat model? | Our pricing is per company, not per developer seat |
| How many instances can be installed with one NBomber business license? | Unlimited |
| Can multiple teams use the same license within one organization? | Yes, a single license can be shared for the whole organization |
| How many executions can be run in parallel? | Unlimited |
| How many users can use the license in parallel? | Unlimited |

## How to load license

To load the license, you can use NBomberRunner

**Example:**

```csharp
NBomberRunner
    .RegisterScenarios(scenario1)
    .WithLicense("Your_License_Key")
    .Run();
```

Another option is [CLI arguments](../../nbomber/cli): --license=Your_License_Key

**Example:**

```
YourProject.dll --license=Your_License_Key
```

```csharp
// then in C# you need to pass CLI args
// to NBomberRunner.Run() method

NBomberRunner
    .RegisterScenarios(scenario1)
    .Run(args);
```

Also, environment variables can be used to get the license key.

```csharp
var licenseKey = Environment.GetEnvironmentVariable("YOUR_LICENSE_KEY");

NBomberRunner
    .RegisterScenarios(scenario1)
    .WithLicense(licenseKey)
    .Run();
```

## Offline license validation

:::info
To validate your license, NBomber requires internet access. However, it also supports offline license validation. If your test environment has limited internet access, you can request offline validation by emailing us directly.
:::

## Open-source extensions

NBomber extensions (protocols, reporting sinks, and plugins) are open source under permissive licenses (Apache-2.0 / MIT). You can read, fork, modify, and contribute to them on [GitHub](https://github.com/PragmaticFlow).

## Third-party software

NBomber uses a number of open-source packages. For the full list with their versions and licenses, see [Third-Party Software](./third-party-software.md).