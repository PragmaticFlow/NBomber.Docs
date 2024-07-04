---
id: webbrowser
title: WebBrowser
sidebar_position: 2
---

import WebBrowserImage from './img/web_browser.jpg';

<center><img src={WebBrowserImage} width="60%" height="40%" /></center>

The WebBrowser package brings browser automation and end-to-end web testing to NBomber. It adds browser-level APIs to interact with browsers and collect frontend performance metrics as part of your NBomber tests. This package aims to provide rough compatibility with the Playwright and Puppeteer API, so you don't need to learn a completely new API.

To work with WebBrowsers, NBomber provides [NBomber.WebBrowser](https://github.com/PragmaticFlow/NBomber.WebBrowser) package that includes extensions for Playwright and Puppeteer frameworks.

:::warning
This package is experimental and might be subject to breaking API changes in the future. While we intend to keep experimental packages as stable as possible, we may need to introduce breaking changes.
:::

:::info
To install [NBomber.WebBrowser](https://github.com/PragmaticFlow/NBomber.WebBrowser) package you should execute the following *dotnet* command:

[![build](https://github.com/PragmaticFlow/NBomber.WebBrowser/actions/workflows/build.yml/badge.svg)](https://github.com/PragmaticFlow/NBomber.WebBrowser)
[![NuGet](https://img.shields.io/nuget/v/nbomber.WebBrowser.svg)](https://www.nuget.org/packages/nbomber.WebBrowser/)

```code
dotnet add package NBomber.WebBrowser
```
:::

## Playwright

Playwright is a library which provides a high-level API to control Chrome or Firefox. Playwright was created specifically to accommodate the needs of end-to-end testing. Playwright supports all modern rendering engines including Chromium, WebKit, and Firefox. Test on Windows, Linux, and macOS, locally or on CI, headless or headed with native mobile emulation.

:::info
To work with the Playwright API, make sure you get familiar with their [documentation](https://playwright.dev/dotnet/docs/input).
:::

```csharp
// downloading the Chrome
var installedBrowser = await new BrowserFetcher(SupportedBrowser.Chrome).DownloadAsync(BrowserTag.Stable);
var browserPath = installedBrowser.GetExecutablePath();

using var playwright = await Playwright.CreateAsync();

await using var browser = await playwright.Chromium.LaunchAsync(
    new BrowserTypeLaunchOptions
    {
        Headless = true,
        ExecutablePath = browserPath
    }
);

var scenario = Scenario.Create("playwright_scenario", async context =>
{
    var page = await browser.NewPageAsync();

    await Step.Run("open nbomber", context, async () =>
    {
        var pageResponse = await page.GotoAsync("https://nbomber.com/");

        var html = await page.ContentAsync();
        var totalSize = await page.GetDataTransferSize();

        return Response.Ok(sizeBytes: totalSize);
    });

    await Step.Run("open bing", context, async () =>
    {
        var pageResponse = await page.GotoAsync("https://www.bing.com/maps");

        await page.WaitForSelectorAsync(".searchbox input");
        await page.FocusAsync(".searchbox input");
        await page.Keyboard.TypeAsync("CN Tower, Toronto, Ontario, Canada");

        await page.Keyboard.PressAsync("Enter");
        await page.WaitForLoadStateAsync(LoadState.Load);

        var totalSize = await page.GetDataTransferSize();
        return Response.Ok(sizeBytes: totalSize);
    });

    await page.CloseAsync();

    return Response.Ok();
})
.WithWarmUpDuration(TimeSpan.FromSeconds(3))
.WithLoadSimulations(
    Simulation.KeepConstant(1, TimeSpan.FromSeconds(30))
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/WebBrowsers/Playwright/PlaywrightExample.cs).*

## Puppeteer

Puppeteer is a library which provides a high-level API to control Chrome or Firefox. Puppeteer offers strong integration with Chrome, providing a straightforward setup and efficient performance for browser automation tasks. It is known for its ease of configuration, fast execution times, and the ability to run Chrome extensions in headfull mode.

:::info
To work with the Puppeteer API, make sure you get familiar with their [documentation](https://www.puppeteersharp.com/api/index.html).
:::

```csharp
// downloading the Chrome
var installedBrowser = await new BrowserFetcher(SupportedBrowser.Chrome).DownloadAsync(BrowserTag.Stable);
var browserPath = installedBrowser.GetExecutablePath();

await using var browser = await Puppeteer.LaunchAsync(
    new LaunchOptions
    {
        Headless = true,
        ExecutablePath = browserPath
    }
);

var scenario = Scenario.Create("puppeteer_scenario", async context =>
{
    await using var page = await browser.NewPageAsync();
    await page.SetCacheEnabledAsync(false); // disable caching

    await Step.Run("open nbomber", context, async () =>
    {
        var pageResponse = await page.GoToAsync("https://nbomber.com/");

        var html = await page.GetContentAsync();
        var totalSize = await page.GetDataTransferSize();

        return Response.Ok(sizeBytes: totalSize);
    });

    await Step.Run("open bing", context, async () =>
    {
        var pageResponse = await page.GoToAsync("https://www.bing.com/maps");

        await page.WaitForSelectorAsync(".searchbox input");
        await page.FocusAsync(".searchbox input");
        await page.Keyboard.TypeAsync("CN Tower, Toronto, Ontario, Canada");

        await page.Keyboard.PressAsync("Enter");
        await page.WaitForNavigationAsync(new NavigationOptions { WaitUntil = [WaitUntilNavigation.Load]});

        var totalSize = await page.GetDataTransferSize();
        return Response.Ok(sizeBytes: totalSize);
    });

    await page.CloseAsync();

    return Response.Ok();
})
.WithWarmUpDuration(TimeSpan.FromSeconds(3))
.WithLoadSimulations(
    Simulation.KeepConstant(1, TimeSpan.FromSeconds(30))
);
```

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/WebBrowsers/Puppeteer/PuppeteerExample.cs).*