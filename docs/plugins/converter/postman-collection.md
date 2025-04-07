---
id: postman_collection
title: Postman Collection
sidebar_position: 3
---

import PostmanCollection from './img/postman-collection.png';
import PostmanExecuted from './img/postman-executed.png';

Postman Collection are portable groups of API requests that can be reused, automated, and shared with others. A collection allows you to store important details for each API request, including authorization type, parameters, headers, request bodies, scripts, variables, and documentation.

## Prepare the Postman Collection File
Here are the essential steps to export a Postman Collection ([you can watch this video](https://youtu.be/OQKMr0ay63c)):
- Create a Postman Collection.
- Next, click the three-dot menu and select the "Export" option.
- Select the version of the Postman Collection and choose the location on your disk where it will be saved.

<center><img src={PostmanCollection} width="100%" height="100%" /></center>

## Run Converter
Use `nb-converter` command to parse Postman Collection and convert to NBomber Scenario:
```
nb-converter PostmanCollectionExample.json -t PostmanCollection -o PostmanHelloWorldScenario.cs
```
<center><img src={PostmanExecuted} width="100%" height="100%" /></center>
   
## Edit the auto-generated Scenario
In the previous step, the converter created a NBomber scenario for testing. Now, you should evaluate whether you have to change any part of the NBomber scenario. Depending on your use case, you might need to:
- Edit steps.
- Add reporting sinks.
- Configure the load simulation.

For example: configuration for KeepConstant, where we control the number of concurrent users.
```csharp
Scenario.Create("scenario", async context =>
{
    var step1 = await Step.Run("step 1 - LIST USERS", context, async () =>
    {
        var request = Http.CreateRequest("GET", "https://reqres.in/api/users?page=2");
                        
        var response = await Http.Send(httpClient, request);

        return response;        
    });
})
.WithLoadSimulations(    
    Simulation.RampingConstant(copies: 50, during: TimeSpan.FromSeconds(30)), // ramping up to 50   
    Simulation.KeepConstant(copies: 50, during: TimeSpan.FromSeconds(30))     // keep 50
    Simulation.RampingConstant(copies: 0, during: TimeSpan.FromSeconds(30))   // ramping down to 0
);
```