---
id: reports
title: Reports
sidebar_position: 7
---

import ReportingSinksImage from './img/reporting-sinks.jpeg';

<center><img src={ReportingSinksImage} width="100%" height="100%" /></center>

Reports intro. NBomber supports HTML, MD, TXT, CSV

## Report API

### WithoutReports

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithoutReports()
    .Run();
```

### WithReportFormats

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithReportFormats(
        ReportFormat.Csv, ReportFormat.Html, 
        ReportFormat.Md, ReportFormat.Txt
    )
    .Run();
```

### WithReportFolder

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithReportFolder("my-reports")
    .Run();
```

### WithReportFileName

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithReportFileName("mongo-db-benchmark")
    .Run();
```

### Upload report to custom destination

```csharp
var result = NBomberRunner
    .RegisterScenarios(scenario)
    .Run();

var htmlReport = result.ReportFiles.First(x => x.ReportFormat == ReportFormat.Html);

var filePath = htmlReport.FilePath;
var html = htmlReport.ReportContent;
```

### WithReportFinalizer

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithReportFinalizer(data =>
    {
        var scnStats = data.ScenarioStats.Where(x => x.ScenarioName != "hidden").ToArray();
        return ReportData.Create(scnStats);
    })
    .Run();
```

```csharp
NBomberRunner
    .RegisterScenarios(scenario)
    .WithReportFinalizer(data =>
    {
        var stepsStats = data.GetScenarioStats("mongo-read-write")
            .StepStats
            .Where(x => x.StepName != "pause")
            .ToArray();

        data.GetScenarioStats("mongo-read-write").StepStats = stepsStats;

        return data;
    })
    .Run();
```