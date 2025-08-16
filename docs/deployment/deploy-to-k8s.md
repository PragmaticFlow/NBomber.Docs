---
id: deploy-to-k8s
title: Deploy to Kubernetes
sidebar_position: 3
---

import K8sDeploymentSingleImage from './img/k8s-deployment-single.jpg';
import K8sCiCdImage from './img/k8s-deployment-ci-cd.jpg';

<center><img src={K8sDeploymentSingleImage} width="60%" height="60%" /></center>

## Overview
This document will help you understand how to deploy NBomber load test to Kubernetes. In the image above, you can see a multi-resource deployment used to run NBomber load tests. Let’s now look at what is included in a [single load test deployment](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/K8sDemo/my-test-1.yaml):

- [NBomber K8sDemo](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/K8sDemo/Program.cs) - We created a minimal NBomber load test project, [containerized it](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/K8sDemo/Dockerfile), and published it to Docker Hub.
- [ConfigMap](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/K8sDemo/my-test-1.yaml#L7) containing the NBomber [JSON Config](../nbomber/json-config.md) file which will be consumed by NBomber load test. This configuration is used to set up the load test: override load simulation settings if needed, configure cluster parameters, and specify the connection string for the NATS message broker.
- [Job](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/K8sDemo/my-test-1.yaml#L50) that spins up 2 containers running the NBomber load test scenario.
- [NATS message broker](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/K8sDemo/my-test-1.yaml#L79) dedicated to NBomber cluster communication.

## CI/CD pipiline execution

<center><img src={K8sCiCdImage} width="90%" height="90%" /></center>

Now let’s review the execution flow of a potential CI/CD pipeline job that can run multiple load tests in parallel and then clean up the associated resources afterward:

1. The CI/CD job applies the [Kubernetes manifest](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/K8sDemo/my-test-1.yaml) to start the load test. Kubernetes will create: NATS, Job and ConfigMap.
```bash
kubectl apply -f my-test-1.yaml
```

2. The k8s Job schedules 2 containers (Coordinator + Agent) and mounts the ConfigMap containing the JSON Config with NBomber Cluster and Scenario settings for these containers.
3. After the load test scenario finishes, the containers will stop but are not automatically removed.
4. (Optional) A CLI procedure may wait for the K8s Job to complete and then extract the HTML report. 
```bash
# --timeout=600s - waits up to 600 seconds (10 minutes). Adjust as needed.

kubectl wait --for=condition=complete --timeout=600s -n <namespace> job/<job-name>
```
After this, the job should find the pod which was the Coordinator (it will log the message: "NBomber started as Coordinator") and then extract the HTML report from the [ReportFolder](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/K8sDemo/my-test-1.yaml#L43). *The NBomber logs will display the full path to the ReportFolder.*

5. A CLI job should destroy all allocated resources for this load test:
```bash
kubectl delete -f my-test-1.yaml
```

:::info
It’s important to note that the ConfigMap `nb-config-my-test-1`, Job `k8sdemo-job-my-test-1` and NATS broker are postfixed with the load test name: `my-test-1`. This prevents naming collisions when multiple deployments (with multiple NATS instances) run in parallel and ensures all resources are grouped for a specific load test. Once the test is finished, cleanup can be performed safely.
:::