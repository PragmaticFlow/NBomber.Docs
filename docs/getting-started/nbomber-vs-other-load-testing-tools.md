---
id: nbomber-vs-other-load-testing-tools
title: NBomber vs other load testing tools
sidebar_position: 2
draft: true
---

People often ask about the benefits of using NBomber compared to other popular load testing tools. It’s a very reasonable question, and I’ll try to answer it.

For the sake of fairness, we'll focus only on self-hosted tools such as Gatling, Locust, and k6. Rather than doing a detailed feature-by-feature comparison, I'd like to highlight some of the advantages that I believe truly make a difference for end users. 

It's also worth noting that in 99% of cases, NBomber's end users are .NET developers, so my perspective will primarily focus on .NET - though not exclusively.

1. Native .NET experience and real debugging
NBomber is a native .NET tool. That sounds obvious, but the implications are huge.

You can:
- Use your preferred IDE (VS Code, Visual Studio, or Rider)
- Debug your load tests just like any other application, even side-by-side with the target API. In some scenarios, especially complex ones, you may want to see what payload you receive in your load test. It’s very convenient when you use the same stack.
- Keep your load tests in the same solution as your application to make navigation, refactoring, and maintenance easier.

In practice, this means no context switching, no custom debugging setups, and no guesswork — just a familiar and efficient development workflow.

2. AI friendly and type safe
3. Separated fails stats allows you to measure how errors flows works

2. Reuse Your Domain Code and Clients
One of the biggest advantages of NBomber is the ability to directly reference your domain and infrastructure libraries.

This allows you to:
- Reuse existing HTTP, gRPC, or database clients
- Reuse DTOs and contract types
- Reuse parts of your real business abstractions. For example, you can set up users or run workflows to prepare a database or other systems using the same code you employ in production flows.

If your system already has wrappers or SDKs, you don’t need to rewrite them in JavaScript or any other language. This eliminates duplication and reduces the risk of mismatched behavior between test and production code.

3. Run Load Tests as Unit Tests (CI/CD Friendly)

4. Performance
NBomber is lightweight. Benchmarks
5. Simple and intuitive API for defining user workflows. NBomber provides a clean and minimal API for modeling load scenarios as user workflows. Instead of dealing with complex DSLs or UI-based test builders, you define behavior directly in code using straightforward constructs.
