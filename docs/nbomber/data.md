---
id: data
title: Data
sidebar_position: 5
---

import DataFeedImage from './img/data-feed.jpeg';

<center><img src={DataFeedImage} width="100%" height="100%" /></center>

The NBomber.Data package provides functionality for NBomber to work with data.

:::info
To start working with [NBomber.Data](https://www.nuget.org/packages/NBomber.Data) package you should install it:

```code
dotnet add package NBomber.Data
```

Also, the [source code is available on Github](https://github.com/PragmaticFlow/NBomber.Data).
:::

## Generate random bytes

Generates an array with random bytes. This method is helpful when you want to test some system (over TCP/etc.) and for this, you need to send a message with a concrete size (for example, 4KB).

```csharp
public static byte[] GenerateRandomBytes(int sizeInBytes)
```

Example:
```csharp
var data = Data.GenerateRandomBytes(100);
```

## Generate fake data

NBomber doesn’t provide tools to generate fake test data. To generate fake data for your tests, we highly recommend looking at [Bogus fake data generator](https://github.com/bchavez/Bogus).

## Data Feed

Data Feed helps inject test data into your load test. It represents a data source (In-Memory, JSON, CSV).

### Load data

```csharp
// It's a type that represents user-defined data.
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
}

// Load by file path. All data will be fully loaded into memory.
var csvData  = Data.LoadCsv<User>("users-feed-data.csv");
var jsonData = Data.LoadJson<User[]>("users-feed-data.json");

// Load by HTTP
var csvData  = Data.LoadCsv<User>("https://test-host.com/users-feed-data.csv");
var jsonData = Data.LoadJson<User[]>("https://test-host.com/users-feed-data.json");
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo/Features/DataFeed).*

### Inject data

After loading the data, we will need to inject it into [Scenario](../nbomber/scenario).

```csharp
var feed = DataFeed.Circular(data);
//var feed = DataFeed.Constant(data);
//var feed = DataFeed.Random(data);

var scenario = Scenario.Create("scenario", async context =>
{
    // highlight-start
    var item = feed.GetNextItem(context.ScenarioInfo);
    // highlight-end
    
    context.Logger.Information("Data from feed: {0}", item.Name);

    await Task.Delay(1_000);
    return Response.Ok();
})
```

NBomber provides multiple strategies for the built-in data feeders.

```csharp
// Creates DataFeed that goes back to the top of the sequence once the end is reached.
var feed = DataFeed.Circular(data);

// Creates DataFeed that picks constant value per Scenario copy.
// Every Scenario copy will have unique constant value.
var feed = DataFeed.Constant(data);

// Creates DataFeed that randomly picks an item per GetNextItem() invocation.
var feed = DataFeed.Random(data);
```