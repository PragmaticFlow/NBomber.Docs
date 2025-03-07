---
id: har
title: HAR
sidebar_position: 2
hide_title: true
---

import NetworkTab from './img/network-tab.png';
import HarExecuted from './img/har-executed.png';

# HAR

## Overview

The HAR (HTTP Archive) file format is a JSON-structured file that contains detailed network traffic data about a browser's interactions with the server serving content for a webpage. This archived log can be used by a web browser to export comprehensive performance data regarding the web pages it loads.

## Prepare the HAR File
    Below are the essential steps to follow for recording HAR in Chrome:
   - Launch a new tab in Chrome.
   - Open Chrome Developer Tools by pressing F12.
   - Choose the Network tab.
   - Ensure that the recording button (the round button) is active and displayed in red.
   - To record multiple consecutive page loads, check the Preserve log box.
   - Type in the URL of your site and begin performing the actions you want your simulated load-test users to carry out.
   - When you're done, click the "Export HAR" button to save your session's content.
   <center><img src={NetworkTab} width="100%" height="100%" /></center>

## Run the NBomber Converter
    Use the convert command to generate a NBomber script from a HAR file:
   ```bash
   nb-converter HarExample.har -t har -o HarHelloWorldScenario.cs
   ```
   <center><img src={HarExecuted} width="80%" height="80%" /></center>
   
## Edit the auto-generated NBomber script
   In the previous step, the converter created a NBomber script for testing. Now, you should evaluate whether you have to change any part of the NBomber script.        Depending on your use case, you might need to:
    - Edit steps.
    - Add reporting sinks.
    - Configure the load simulation.

    For example: configuration for KeepConstant (Closed systems), where we control the number of concurrent users.
    ```csharp
        Scenario.Create("scenario", async context =>
        {
            var step1 = await Step.Run("POST reqres.in/api/users (1)", context, async () =>
            {
                var request = Http.CreateRequest("POST", "https://reqres.in/api/users")
                    .WithHeader("accept", "*/*")
                    .WithHeader("accept-encoding", "gzip, deflate, br, zstd")
                    .WithHeader("accept-language", "en-US,en;q=0.9")
                    .WithHeader("cache-control", "no-cache")
                    .WithHeader("content-length", "34")
                    .WithHeader("content-type", "application/json")
                    .WithHeader("origin", "https://reqres.in")
                    .WithHeader("pragma", "no-cache")
                    .WithHeader("priority", "u=1, i")
                    .WithHeader("referer", "https://reqres.in/")
                    .WithHeader("sec-ch-ua", "\"Opera\";v=\"116\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"")
                    .WithHeader("sec-ch-ua-mobile", "?0")
                    .WithHeader("sec-ch-ua-platform", "\"Windows\"")
                    .WithHeader("sec-fetch-dest", "empty")
                    .WithHeader("sec-fetch-mode", "cors")
                    .WithHeader("sec-fetch-site", "same-origin")
                    .WithHeader("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/116.0.0.0");
                request.WithBody(new StringContent(@"{\"name\":\"morpheus\",\"job\":\";leader\"}", Encoding.UTF8, "application/json"));

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

    *You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HelloWorld/HelloWorldExample.cs).*