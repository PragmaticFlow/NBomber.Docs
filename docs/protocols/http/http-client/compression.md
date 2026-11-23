---
id: compression
title: Compression (GZip, Brotli)
sidebar_position: 3
---

<Since version="NBomber.Http 7.0.0" />

NBomber.Http can compress request bodies and decompress response bodies with GZip or Brotli. In both cases, NBomber counts the **compressed** size in the data transfer statistics: the bytes that were sent over the network.

## Request compression

`WithCompression` compresses the request body and adds the `Content-Encoding` header (`gzip` or `br`). It works with any body: `WithJsonBody` or `WithBody`.

```csharp
var request =
    Http.CreateRequest("POST", "https://nbomber.com/api/users")
        .WithJsonBody(user)
        .WithCompression(RequestCompression.GZip); // or RequestCompression.Brotli

var response = await httpClient.SendRequest(request);
```

For a JSON body, you can also pass the compression to `WithJsonBody`:

```csharp
var request =
    Http.CreateRequest("POST", "https://nbomber.com/api/users")
        .WithJsonBody(user, compression: RequestCompression.Brotli);
```

How it works:

- Call `WithCompression` after the body is set. A body that is set later replaces the compressed content.
- The body is compressed once, when the request is built, not on each send.
- The compressed body is sent with an exact `Content-Length` (not chunked), and the data transfer statistics count the compressed bytes.
- The other content headers (for example, `Content-Type`) are kept.
- If the request has no body, or the compression is `RequestCompression.None`, the request isn't changed.

:::info
The server must support compressed request bodies. For example, in ASP.NET Core, enable the [request decompression middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-decompression). A server without this support usually rejects the request or fails to read the body.
:::

## Response decompression

The `automaticDecompression` parameter of `CreateDefaultClient` enables decompression of response bodies. The client then sends an `Accept-Encoding` header and decompresses the response body.

```csharp
var httpClient = Http.CreateDefaultClient(
    automaticDecompression: DecompressionMethods.GZip | DecompressionMethods.Brotli
);

var request = Http.CreateRequest("GET", "https://nbomber.com/api/users")
                  .WithHeader("Accept", "application/json");

// the body is decompressed before it is deserialized
var response = await httpClient.SendRequest<UserData[]>(request);
```

- The default value is `DecompressionMethods.None`: the client doesn't decompress response bodies.
- Supported methods: `GZip` and `Brotli`. Other flags, including `Deflate`, are ignored: a `deflate` response body is returned compressed.
- Enable decompression if you read a compressed body as text or JSON. `SendRequest<T>` deserializes the body as it is, so a compressed body fails to deserialize.

### Data transfer size of compressed responses

The data transfer statistics count the bytes that were received over the network: the compressed body, and the original `Content-Length` and `Content-Encoding` headers (.NET removes these headers from the decompressed response).

One exception: a compressed body without `Content-Length` (for example, chunked) that is read with `httpCompletion: HttpCompletionOption.ResponseHeadersRead` isn't counted, because it isn't received yet when the step ends.

:::warning
This applies only to a client created with `Http.CreateDefaultClient(automaticDecompression: ...)`. If you create your own `HttpClient` with the .NET `AutomaticDecompression` setting, .NET decompresses the body itself, and NBomber reports the **decompressed** body size.
:::
