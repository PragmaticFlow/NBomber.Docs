---
id: data
title: Data
sidebar_position: 4
---

import DataFeedImage from './img/data-feed.jpeg';

<center><img src={DataFeedImage} width="100%" height="100%" /></center>

The [NBomber.Data](https://github.com/PragmaticFlow/NBomber.Data) plugin provides functionality for NBomber to work with data. It helps you generate random bytes or use DataFeed abstraction to feed data into your load test scenario.

:::info
To install [NBomber.Data](https://www.nuget.org/packages/NBomber.Data) package you should execute the following *dotnet* command:

[![build](https://github.com/PragmaticFlow/NBomber.Data/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.Data)
[![NuGet](https://img.shields.io/nuget/v/nbomber.data.svg)](https://www.nuget.org/packages/nbomber.data/)

```code
dotnet add package NBomber.Data
```
:::

## DataFeed

DataFeed helps inject test data into your load test. Conceptually, it represents a data stream that can be used inside NBomber scenarios. It is defined via the following interface:

```csharp
public interface IDataFeed<T>
{
    T[] Items { get; }
    T GetNextItem(ScenarioInfo scenarioInfo);
}
```

To create a DataFeed you need to provide data. The source can be any type that implements `IEnumerable<T>`, for example array of `int[]` or `List<User>`. Currently NBomber.Data provides three different DataFeed types. Each of them should be used based on your requirements.

```csharp
// Creates DataFeed that randomly picks an item per `DataFeed.GetNextItem()` invocation.
DataFeed.Random(IEnumerable<T> data);

// Creates DataFeed that picks constant value per Scenario copy. 
// Every Scenario copy will have unique constant value.
DataFeed.Constant(IEnumerable<T> data);

// Creates DataFeed that goes back to the top of the sequence once the end is reached.
DataFeed.Circular(IEnumerable<T> data);
```

### Random DataFeed

DataFeed with random values.

```csharp
var id = new[] { 10, 11, 12, 13, 14 };

// here we create Random DataFeed 
// that randomly picks an item per GetNextItem() invocation.
var myDataFeed = DataFeed.Random(users);

var scenario = Scenario.Create("scenario", async ctx =>
{
    // then in Scenario you can get RANDOM values from the DataFeed

    var number = myDataFeed.GetNextItem(ctx.ScenarioInfo); // 10    
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 10
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 14   
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 13   
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 11       
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 12       

    return Response.Ok();
})
```

### Circular DataFeed

DataFeed with circular/sequential values.

```csharp
var id = new[] { 10, 11, 12, 13, 14 };

// here we create Circular DataFeed 
// that goes back to the top of the sequence once the end is reached.
var myDataFeed = DataFeed.Circular(users);

var scenario = Scenario.Create("scenario", async ctx =>
{
    // then in Scenario you can get SEQUENTIAL values from the DataFeed

    var number = myDataFeed.GetNextItem(ctx.ScenarioInfo); // 10    
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 11
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 12   
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 13   
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 14       
    
    // we reached the end of the stream and restart iteration
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 10       
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 11       
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 12       
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 13
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 14

    return Response.Ok();
})
```

### Constant DataFeed

DataFeed with constant values per ScenarioCopy instance. This DataFeed type is usually used to get a unique distributed value per ScenarioCopy instance.

```csharp
var id = new[] { 10, 11, 12, 13, 14 };

// here we create Constant DataFeed 
// that picks constant value per Scenario copy.
// Every Scenario copy will have unique constant value.
var myDataFeed = DataFeed.Constant(users);

var scenario = Scenario.Create("scenario", async ctx =>
{
    // then in Scenario you can get the constant value 
    // that relates to specific ScenarioCopy instance

    // since we configured `Simulation.KeepConstant(copies: 1)`
    // the returned value will be always the same for specific ScenarioCopy instance
    
    var number = myDataFeed.GetNextItem(ctx.ScenarioInfo); // 12    
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 12
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 12   
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 12   
    number = myDataFeed.GetNextItem(ctx.ScenarioInfo);     // 12           

    return Response.Ok();
})
.WithLoadSimulations(
    Simulation.KeepConstant(copies: 1, during: TimeSpan.FromSeconds(30)) // here we run only one ScenarioCopy
);
```

### Read data from JSON

NBomber.Data provides extensions to read data from local or remote JSON file.

```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
}

// load from local JSON file
var users = Data.LoadJson<User[]>("data.json");

// load from remote JSON file
var users = Data.LoadJson<User[]>("https://YOUR_HOST/data.json");

// now we can create DataFeed from `users: IEnumerable<User>`
var myDataFeed = DataFeed.Constant(users);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DataDemo/JsonFeed.cs).*

### Read data from CSV

NBomber.Data provides extensions to read data from local or remote CSV file.

```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
}

// load from local JSON file
var users = Data.LoadCsv<User>("data.csv");

// load from remote JSON file
var users = Data.LoadCsv<User>("https://YOUR_HOST/data.csv");

// now we can create DataFeed from `users: IEnumerable<User>`
var myDataFeed = DataFeed.Constant(users);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DataDemo/CsvFeed.cs).*

## LargeDataFeed

LargeDataFeed is designed for data sets that are too large or too expensive to keep entirely in memory (RAM). It writes all items to a temporary SQLite database and keeps only a small portion of them in memory using a buffer.

While your scenario processes the items currently in memory, the feed reads the next items from the database in the background. This approach effectively creates a sliding window over the data, allowing LargeDataFeed to process data sets much larger than the available memory.

LargeDataFeed also relies heavily on [ValueTask](https://devblogs.microsoft.com/dotnet/understanding-the-whys-whats-and-whens-of-valuetask/) which helps minimize memory allocations when returning items from the feed.

### When to use it

LargeDataFeed is a good choice when your data set is bigger than 100-200 MB.

### Example

This example reads a large CSV file and gives the items to a scenario.

```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class LargeDataFeedExample
{
    public async Task Run()
    {
        // here we create the feed one time
        await using var dataFeed = LargeDataFeed.Circular<User>(elementsInMemoryCount: 5000);

        var scenario = Scenario.Create("scenario", async ctx =>
        {
            // get next item from the feed.
            // the item will come from memory buffer
            var user = await dataFeed.GetNextItem(ctx.ScenarioInfo);

            ctx.Logger.Information($"UserId: {user.Id}");

            return Response.Ok();
        })
        .WithInit(ctx =>
        {
            // the stream reads the file on demand, it does not load the file into memory
            using var stream = Data.CreateCsvStream<User>("users.csv");

            // LoadData writes all items to the temporary SQLite database
            dataFeed.LoadData(stream, ctx.Logger);

            return Task.CompletedTask;
        })
        .WithLoadSimulations(Simulation.KeepConstant(copies: 50, during: TimeSpan.FromMinutes(5)));

        NBomberRunner
            .RegisterScenarios(scenario)
            .Run();
    }
}
```

### API

LargeDataFeed implements the following interface:

```csharp
public interface IAsyncDataFeed<T> : IAsyncDisposable
{
    // Loads data into the feed. You must call it in scenario initialization.
    void LoadData(IEnumerable<T> data, Serilog.ILogger? logger = null);

    // Returns the next data item.
    ValueTask<T> GetNextItem(ScenarioInfo scenarioInfo);
}
```

NBomber.Data provides three LargeDataFeed types. They match the three `DataFeed` types.

```csharp
// Creates LargeDataFeed that randomly picks an item per GetNextItem() invocation.
LargeDataFeed.Random<T>(int elementsInMemoryCount = 1000);

// Creates LargeDataFeed that picks constant value per Scenario copy.
// Every Scenario copy will have unique constant value.
LargeDataFeed.Constant<T>(int elementsInMemoryCount = 1000);

// Creates LargeDataFeed that goes back to the top of the sequence once the end is reached.
LargeDataFeed.Circular<T>(int elementsInMemoryCount = 1000);
```

### elementsInMemoryCount

The `elementsInMemoryCount` parameter determines how many items the feed keeps in memory. It works like a sliding window. The default value is 1000. The minimum value is 100.

:::tip
Your goal is to find a good balance. The value must be big enough for the scenario to always take items from memory. Then the feed does not make the more expensive call to SQLite, which reads from disk.
:::

Your scenario reads one batch from memory, while the feed loads the next batch in the background. If the scenario reads the items faster than the feed loads them, the feed writes this warning:

```
You should use bigger elementsInMemoryCount, because in memory items were exhausted too fast
```

To see this warning, you must pass a logger to `LoadData`. If you see this warning, increase `elementsInMemoryCount`.

```csharp
dataFeed.LoadData(stream, ctx.Logger);
```

### Read large data from JSON and CSV

`Data.LoadJson` and `Data.LoadCsv` read the full file into memory. For a large file, use `Data.CreateJsonStream` or `Data.CreateCsvStream` instead. These methods read one item at a time, on demand.

```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
}

// stream from a local JSON file
using var stream = Data.CreateJsonStream<User>("users.json");

// stream from a remote JSON file
using var stream = Data.CreateJsonStream<User>("https://YOUR_HOST/users.json");

// stream from a local CSV file
using var stream = Data.CreateCsvStream<User>("users.csv");

// stream from a remote CSV file
using var stream = Data.CreateCsvStream<User>("https://YOUR_HOST/users.csv");
```

Both methods return an object that implements `IEnumerable<T>` and `IDisposable`. You can pass this object directly to `LoadData`.

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

To generate fake data for your tests, we highly recommend looking at [Bogus fake data generator](https://github.com/bchavez/bogus). It's a popular library that contains useful methods for generating data.

:::info
To install [Bogus](https://www.nuget.org/packages/bogus) package you should execute the following *dotnet* command:

[![NuGet](https://img.shields.io/nuget/v/bogus.svg)](https://www.nuget.org/packages/bogus)

```code
dotnet add package Bogus
```
:::

Example:

```csharp
public class FakeUser
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Address { get; set; }
}

public class FakeDataGenExample
{
    private IDataFeed<FakeUser> _usersFeed;

    public void Run()
    {
        var scenario = Scenario.Create("scenario", async ctx =>
        {
            var user = _usersFeed.GetNextItem(ctx.ScenarioInfo);

            await Task.Delay(1_000);

            ctx.Logger.Information($"ScenarioCopyId: {ctx.ScenarioInfo.ThreadNumber}, UserId: {user.Id}");

            return Response.Ok();
        })
        .WithInit(ctx =>
        {
            // we create 5 users and our Simulation.KeepConstant(copies: 5)
            var users = GenerateFakeUsers(5).ToArray();

            _usersFeed = DataFeed.Constant(users);

            return Task.CompletedTask;
        })
        .WithLoadSimulations(Simulation.KeepConstant(copies: 5, during: TimeSpan.FromSeconds(30)));

        NBomberRunner
            .RegisterScenarios(scenario)
            .Run();
    }

    private IEnumerable<FakeUser> GenerateFakeUsers(int count)
    {
        var faker = new Faker<FakeUser>()
            .RuleFor(u => u.Id, f => f.UniqueIndex)
            .RuleFor(u => u.FirstName, f => f.Person.FirstName)
            .RuleFor(u => u.LastName, f => f.Person.LastName)
            .RuleFor(u => u.Address, f => f.Address.FullAddress());

        return faker.GenerateLazy(count);
    }
}
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/DataDemo/FakeDataGen.cs).*