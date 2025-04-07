---
id: overview
title: Overview
sidebar_position: 1
hide_title: true
---

import ConvertedImg from './img/converter.jpg';

# Converter

<center><img src={ConvertedImg} width="70%" height="70%" /></center>

## Overview
[Converter](https://github.com/PragmaticFlow/NBomber.Converter) is a [.NET tool](https://learn.microsoft.com/en-us/dotnet/core/tools/global-tools) that generates an NBomber Scenario file by parsing various sources:
- [HAR](har.md) - [You can record a web browser session](https://youtu.be/VUqUbPs_dD0) and then convert it into an NBomber Scenario by parsing the generated HAR output file.
- [Postman Collection](postman-collection.md) - [You can export your Postman Collection](https://youtu.be/OQKMr0ay63c) and then convert it into an NBomber Scenario.

## Installation
:::info
[![build](https://github.com/PragmaticFlow/NBomber.Converter/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.Converter)
[![NuGet](https://img.shields.io/nuget/v/nbomber.converter.svg)](https://www.nuget.org/packages/nbomber.converter/)

Converter Tool can be installed as a global CLI tool using the following command:
```
dotnet tool install -g nbomber.converter.tool
```

To install a pre-release version or a specific version of a tool, specify the version number by using the --version option, as shown in the following example:
```
dotnet tool install -g nbomber.converter.tool --version 0.1.1
```
:::

## Run Converter
Use the `nb-converter` command to generate a NBomber scenario from a target file.

For example, here is the command to convert the HAR file to a NBomber scenario:
```
nb-converter <target> -t <file_type> -o <output>
```

### CLI Arguments
The list of available command line (CLI) arguments of NBomber:

| command     | description | example |
| ----------- | ----------- | ----------- |
| -t (or --file-type) | Input file type *(if not specified, it will be detected automatically)* | -t HAR |
| -o (or --output) | Location of the output file | -o HarScenario.cs |

Example with HAR file
```
nb-converter har_file.har -t HAR -o HarScenario.cs
```

Example with Postman Collection file
```
nb-converter postman_file.json -t PostmanCollection -o PostmanScenario.cs
```