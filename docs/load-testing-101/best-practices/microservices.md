---
id: microservices
title: Load Testing Microservices
sidebar_position: 1
---

import MicroservicesLoadWebApp from './img/microservices_load_web_app.jpg';
import MicroservicesIsolatedTests from './img/microservices_isolated_tests.jpg';
import MicroservicesMock from './img/microservices_mock.jpg';

When it comes to load testing microservices, we usually suggest applying two strategies:
### 1. Simulate User Journeys Across the Entire Application (End-to-end)

<center><img src={MicroservicesLoadWebApp} width="50%" height="50%" /></center>

One effective approach to load testing is simulating real-world user flows that interact with multiple services. These end-to-end tests replicate how users actually use your application—from logging in and browsing, to making purchases or performing other key actions.

By executing these flows under load, you can assess how your microservices perform collectively. This helps identify bottlenecks in the orchestration of services, spot resource contention, and evaluate system behavior under realistic conditions. 

:::info
**Key Benefits**:
- Understand how services interact under load.
- **Uncover integration or orchestration issues**.
- Test autoscaling configuration to avoid unexpected overloads and ensure your system scales reliably under load.
- Validate that the system meets performance expectations from a user’s perspective.

**Downsides**:
- **High Infrastructure Cost**: Running load tests across the entire system typically requires spinning up all microservices, databases, caches, queues, and other dependencies. This can be resource-intensive, especially if you need to scale components just for the purpose of the test. For big companies this type of tests can lead to significant costs.
- **Slower Feedback Loop**: Because of the orchestration involved, these tests take longer to set up, prepare data and run, making them less suitable for fast, iterative development cycles. As a result, your developers might only discover performance degradations at the last moment.

**Recommendation**:
- **We recommend using end-to-end strategy, as it can reveal issues that are difficult to identify** when testing microservices in isolation (we explain this in more detail later on this page). However, **big companies typically run such tests less frequently** — often in preparation for major events like Black Friday or monthly releases. The main reason to run such tests less frequently is due to their cost — depending on the scale of the company, these tests can be expensive to run. For small and medium-sized companies, infrastructure costs may not be an issue — they often utilize their staging environments for this purpose.
- Usually this type of tests is writen by automation QA engineers, not developers.
- To write such tests based on user journeys, **we recommend using the [Closed Model](../../nbomber/load-simulation.md#closed-model) for simulating workload**, since the user flow is transactional and modeled as a sequence of dependent steps.
:::

### 2. Test Individual Microservices in Isolation

<center><img src={MicroservicesIsolatedTests} width="30%" height="30%" /></center>

While end-to-end testing provides a macro view, it’s equally important to test microservices in isolation. This strategy helps you pinpoint which services may struggle with performance independently of the rest of the system.

In isolated tests, you can simulate the service's inputs—usually HTTP requests, message queue events, or gRPC calls—and measure how it handles increasing load. This allows you to fine-tune specific services, detect memory leaks, or assess how the service scales independently.

:::info
**Key Benefits**:
- **Low infrastructure costs**: These tests are usually very easy to set up and run even on developer machine. 
- **Fast feedback loop**: You can quickly identify performance degradation in a specific service. **Isolated tests can be easily integrated into your CI/CD pipeline** and treated like regular unit or integration tests.
- Identify performance bottlenecks within individual services.

**Downsides**:
- **These tests are not fully representative**: They typically cover only a single service. The worst-case scenario is when multiple services, each performing well in isolated tests but fail to handle the expected load when run together in a production environment.

**Recommendation**:
- **We recommend using this strategy as it is cheaper than full end-to-end load tests and provides an easy way for developers to run it locally and get quick results.** 
- Usually this type of tests are writen by developers and not automation QA engineers.
- **Prioritize services that interact directly with the database**. If these services perform well, upstream dependent services will typically also benefit. Database scalability is often the main bottleneck, so it's more effective to focus on services that work directly with the database rather than those that depend on other services in the chain.
- To write isolated load tests, **we recommend using the [Open Model](../../nbomber/load-simulation.md#open-model) for simulating workload**. From the perspective of an individual service, it may expose several endpoints that are partially used by different user flows concurrently. At this level, it's simpler to reason about the service in terms of request rate rather than number of concurrent users. Additionally, when defining your [SLO/SLA](https://cloud.google.com/blog/products/devops-sre/sre-fundamentals-slis-slas-and-slos), companies usually focus on metrics like request rate and error rate — so using the Open Model aligns well with these targets. Another important benefit is that the Open Model tends to produce more consistent results, which makes it easier to apply reliable assertion logic.
:::

<center><img src={MicroservicesMock} width="60%" height="60%" /></center>

If your microservice depends on other services, especially those outside your ownership, you should consider mocking them.
Mocking dependent services is often necessary to isolate the system under test and ensure more reliable and consistent load test results. Make sure your mocked API allows you to configure latency delays and has sufficient throughput capacity (at a minimum, it should be fast enough not to become a bottleneck).