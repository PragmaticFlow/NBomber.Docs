---
id: installation
title: Installation
sidebar_position: 3
---

:::info
Installation prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download)
- [Visual Studio Code](https://code.visualstudio.com/) with [C#](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp) extension.
:::

## Install NBomber

NBomber packages are shipped via a [NuGet package manager](https://www.nuget.org/packages?q=nbomber).

Create a console application project.
```
dotnet new console -n [project_name] -lang ["C#"]
```

Open the project folder.
```
cd [project_name]
```

Add NBomber package.
```
dotnet add package NBomber
```