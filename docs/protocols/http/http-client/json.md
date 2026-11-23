---
id: json
title: JSON support
sidebar_position: 2
---

NBomber.Http provides helper methods that simplify working with JSON: `WithJsonBody` serializes the request body, and `SendRequest<T>` deserializes the response body.

## Send JSON

`WithJsonBody<T>(data)` serializes `data` to JSON, sets it as the request body and adds the `Content-Type: application/json` header.

```csharp
var httpClient = Http.CreateDefaultClient();

var scenario = Scenario.Create("http_scenario", async context =>
{
    var user = new UserData { UserId = 1, Title = "anton" };

    var request =
        Http.CreateRequest("POST", "https://nbomber.com")
            .WithJsonBody(user);

    var response = await httpClient.SendRequest(request);

    return response;
});
```

To compress the JSON body, use the `compression` parameter <Since version="NBomber.Http 7.0.0" />. See [Request compression](./compression.md#request-compression).

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/HttpSendJsonExample.cs).*

## Receive JSON

`SendRequest<TResponse>` sends the request and deserializes the JSON body of the response to `TResponse`.

```csharp
var httpClient = Http.CreateDefaultClient();

var scenario = Scenario.Create("http_scenario", async context =>
{
    var request =
        Http.CreateRequest("GET", "https://jsonplaceholder.typicode.com/todos/1")
            .WithHeader("Accept", "application/json");

    var response = await httpClient.SendRequest<UserData>(request);

    var userData = response.Payload.Value.Data;          // the deserialized body
    var httpResponse = response.Payload.Value.Response;  // the HttpResponseMessage
    var title = userData.Title;

    return response;
});
```

<Since version="NBomber.Http 7.0.0" /> `SendRequest<TResponse>` handles the response like this:

| Response | Result | `Data` |
|---|---|---|
| 2xx with a JSON body | OK | The deserialized value |
| 204 No Content, or 2xx with an empty body | OK | `default(T)` |
| 2xx with a body that isn't valid JSON for `T` | Failed. The status code is kept, and `Message` contains the deserialization error. | `default(T)` |
| Non-2xx | Failed. The body isn't deserialized: read `Response.Content` to inspect it. | `default(T)` |

:::info
If the server sends a compressed response body, enable [response decompression](./compression.md#response-decompression). `SendRequest<T>` deserializes the body as it is, so a compressed body fails to deserialize.
:::

*You can find the complete example by this [link](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/HTTP/HttpSendJsonExample.cs).*

## Serializer options

`WithJsonBody` and `SendRequest<T>` use the global serializer options. You can change them as follows:

```csharp
// By default GlobalJsonSerializerOptions is configured with JsonSerializerOptions.Web
Http.GlobalJsonSerializerOptions = JsonSerializerOptions.Web;

// You may also customize the configuration to suit your specific needs
Http.GlobalJsonSerializerOptions = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};
```

If the global options don't fit your use case, you can pass different serializer options for one request:

```csharp
var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

// for the request body
var request = Http.CreateRequest("POST", "https://nbomber.com")
                  .WithJsonBody(user, options);

// for the response body
var response = await httpClient.SendRequest<UserData>(request, jsonOptions: options);
```
