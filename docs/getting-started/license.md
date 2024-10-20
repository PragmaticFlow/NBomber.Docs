---
id: license
title: License
sidebar_position: 5
---

:::info
NBomber is FREE only for personal use. You can't use FREE version for an organization.
:::

NBomber supports two types of license:

- Business license - Allows the use of NBomber within your organization.
- Enterprise license - Allows the use of NBomber within your organization, and additionally, provides access to the cluster mode of execution.

:::tip
If you're interested in experimenting with NBomber Cluster but do not have an enterprise license, you can use of the [Local Dev Cluster](../cluster/local-dev-cluster).
:::

## Frequently asked questions

| Question | Answer | 
| - | - |
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

Another option is [CLI arguments](cli): --license=Your_License_Key

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
