---
id: connections
title: Connections & HTTP versions
sidebar_position: 1
---

`Http.CreateDefaultClient` creates an `HttpClient` that is configured for load testing: how many connections it opens, which HTTP version it uses, and how it selects IP addresses. This page describes these settings.

## CreateDefaultClient parameters

All parameters are optional. Pass only the ones you need, by name:

```csharp
var httpClient = Http.CreateDefaultClient(
    maxConnectionsPerServer: 1000,
    httpVersion: "2.0",
    dnsSelection: DnsSelection.RoundRobin
);
```

| Parameter | Default | Description |
|---|---|---|
| `maxConnectionsPerServer` | 5000 | The maximum number of connections per endpoint. See [Connections limit](#connections-limit). |
| `pooledConnectionLifetime` | 3 minutes | <Since version="NBomber.Http 7.0.0" /> How long a connection can stay in the pool before it is closed. See [Connection lifetime and DNS changes](#connection-lifetime-and-dns-changes). |
| `dnsSelection` | `DnsSelection.Random` | <Since version="NBomber.Http 7.0.0" /> Which IP address a new connection uses when the host name resolves to several addresses. See [DNS selection](#dns-selection). |
| `httpVersion` | `"2.0"` | <Since version="NBomber.Http 7.0.0" /> The HTTP version for every request sent with this client: `"1.1"`, `"2.0"` or `"3.0"`. See [HTTP versions](#http-versions). |
| `versionPolicy` | `RequestVersionOrLower` | <Since version="NBomber.Http 7.0.0" /> How the client selects the HTTP version. See [HTTP versions](#http-versions). |
| `automaticDecompression` | `DecompressionMethods.None` | <Since version="NBomber.Http 7.0.0" /> Which compressed response bodies the client decompresses. See [Response decompression](./compression.md#response-decompression). |
| `requestTimeout` | 1 minute | <Since version="NBomber.Http 7.0.0" /> How long the client waits for a response before the request fails (`HttpClient.Timeout`). Use `Timeout.InfiniteTimeSpan` to disable it. See [Timeout](./http-client.md#timeout). |

The idle connection timeout (`PooledConnectionIdleTimeout`) is 1.5 minutes.

## HTTP versions

<Since version="NBomber.Http 7.0.0" />

By default, the client uses HTTP/2 if the server supports it, and HTTP/1.1 otherwise (`httpVersion: "2.0"` with `versionPolicy: HttpVersionPolicy.RequestVersionOrLower`):

- For `https` URLs, the client and the server agree on the version during the TLS handshake (ALPN). If the server doesn't support HTTP/2, the client uses HTTP/1.1.
- For `http` URLs (without TLS), HTTP/2 isn't negotiated, so the client uses HTTP/1.1.

The `versionPolicy` parameter defines how the client selects the version:

| Policy | Behavior |
|---|---|
| `RequestVersionOrLower` (default) | Uses `httpVersion` if the server supports it, otherwise a lower version. |
| `RequestVersionExact` | Uses only `httpVersion`, otherwise the request fails. |
| `RequestVersionOrHigher` | Uses `httpVersion` or a higher version. |

Examples:

```csharp
// HTTP/1.1 only
var httpClient = Http.CreateDefaultClient(httpVersion: "1.1");

// HTTP/2 without TLS (h2c), for example for a gRPC or an internal service.
// Without TLS there is no version negotiation, so the exact version is required.
var httpClient = Http.CreateDefaultClient(httpVersion: "2.0", versionPolicy: HttpVersionPolicy.RequestVersionExact);

// HTTP/3 if the server supports it (HTTP/3 requires QUIC support in the operating system)
var httpClient = Http.CreateDefaultClient(httpVersion: "3.0");

// the client doesn't change the version of requests (by default, HTTP/1.1)
var httpClient = Http.CreateDefaultClient(httpVersion: null);
```

To use a different version for one request, use `WithVersion`. The version of the request has priority over the `httpVersion` of the client:

```csharp
var httpClient = Http.CreateDefaultClient(); // HTTP/2 or lower

var request = Http.CreateRequest("GET", "https://nbomber.com")
                  .WithVersion("1.1"); // this request uses HTTP/1.1
```

:::info
`HttpClient.DefaultRequestVersion` isn't used for requests sent with `SendAsync(HttpRequestMessage)`, which `SendRequest` uses. This is why `CreateDefaultClient` sets the version on every request itself. If you create your own `HttpClient`, set `request.Version` and `request.VersionPolicy` on each request, or use `WithVersion`.
:::

## Multiple HTTP/2 connections

<Since version="NBomber.Http 7.0.0" />

With HTTP/2, one connection carries many parallel requests (streams). The server limits the number of parallel streams per connection, usually to 100. When all connections reach this limit, `CreateDefaultClient` opens a new connection (`EnableMultipleHttp2Connections = true`), so requests don't wait in a client-side queue.

This is important for load tests: without this setting, all requests go through one connection, and the client queues requests above the stream limit. The latency then includes the time in the client queue, and the load on the server is lower than you planned.

## DNS selection

<Since version="NBomber.Http 7.0.0" />

A host name can resolve to several IP addresses, for example when a load balancer uses DNS round-robin. .NET `HttpClient` does not guarantee that it spreads connections evenly over these addresses. By default, it connects to the first address that the DNS resolver returns. Then connection pooling reuses this connection for many requests. As a result, most or all requests of your load test can go to the same IP address, and one backend server gets all the load.

The `dnsSelection` parameter defines which address a new connection uses:

| Value | Behavior |
|---|---|
| `Default` | Uses the built-in .NET behavior. .NET starts with the first address and goes to the next address only if the connection fails. When the first address works, all new connections go to it, so DNS round-robin doesn't balance the load. |
| `Random` (**default**) | Starts with a random address for each new connection. |
| `RoundRobin` | Starts with the next address (in sequence) for each new connection. |

`Random` and `RoundRobin` spread the connections over all addresses, as many independent clients do. If the connection to the selected address fails, the next addresses are tried.

```csharp
var httpClient = Http.CreateDefaultClient(dnsSelection: DnsSelection.RoundRobin);
```

## Connection lifetime and DNS changes

<Since version="NBomber.Http 7.0.0" />

The client resolves DNS only when it opens a new connection. The `pooledConnectionLifetime` parameter defines how long a connection can stay in the pool before it is closed. Because of this, it is also the maximum time before the client sees a DNS change, for example a blue/green switch or a failover.

- A smaller value finds DNS changes faster, but the client opens new connections (TCP and TLS handshakes) more frequently.
- A larger value reuses connections longer, but the client can keep sending requests to old IP addresses after a DNS change.

```csharp
var httpClient = Http.CreateDefaultClient(pooledConnectionLifetime: TimeSpan.FromMinutes(1));
```

## Connections limit

You may need to restrict the maximum number of socket connections per endpoint.

```csharp
var httpClient = Http.CreateDefaultClient(maxConnectionsPerServer: 3);
```

With HTTP/1.1, one connection carries one request at a time, so when the limit is reached, new requests wait for a free connection.
