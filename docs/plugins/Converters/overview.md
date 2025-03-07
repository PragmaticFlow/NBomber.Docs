---
id: overview
title: Overview
sidebar_position: 1
hide_title: true
draft: true
---

# NBomber Converter

## Overview

The NBomber Converter is a .NET tool that generates a NBomber scenario file from various sources, such as HTTP requests in a HAR file or a Postman Collection.

## Installation
The NBomber Converter is available as a NuGet package, which can be installed using the following command.
    ```bash
    nuget install NBomber.Converter.Tool
    ```

## Options
Here is a list of options available in NBomber Converter:
 - Input. Input file path. Positional parameter. Required
 - Input file type (-t, --file-type). If not specified, it will be detected automatically.
 - Output (-o, --output). Location of the output file. Required

## Run the NBomber Converter
    Use the nb-convert command to generate a NBomber script from a file.
    
    For example, here is the command to convert the HAR file to a NBomber scenario:
   ```bash
   nb-converter HarExample.har -o HelloWorldScenario.cs
   ```