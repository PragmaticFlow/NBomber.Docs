---
title: NBomber Studio 0.8
tags: [nbomber-studio-release, load-testing]
---

import ReactPlayer from 'react-player'
import NbSchedulesImage from './img/nb-studio-0.8/nb-studio-schedules.jpg'
import NbAutoRefreshImage from './img/nb-studio-0.8/nb-studio-auto-refresh.jpg'
import NbLoadTestTabsImage from './img/nb-studio-0.8/nb-studio-load-test-tabs.jpg'
import NbLicenseInfoImage from './img/nb-studio-0.8/nb-studio-license-info.jpg'

**NBomber Studio 0.8** is out! This release brings **Load Test Schedules** — a long-requested feature that lets you run a load test automatically at specific times, so you no longer need to kick it off manually. We've also extended the `Container Spec` file, which now supports more standard Kubernetes settings and gives you the flexibility to pass secrets and other arguments via environment variables.

<center><img src={NbSchedulesImage} width="80%" /></center>

<!--truncate-->

## Load Test Schedules
Load Test Schedules let you configure a load test to run automatically at specific times, so you no longer need to kick it off manually.

<div className="video-container">
  <ReactPlayer
    src='https://www.youtube.com/watch?v=BCVlx4YVDf0'
    controls
    loop
    style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
  />
</div>

## Container Spec Settings
We've also extended the `Container Spec` settings for running load tests in Kubernetes. The following standard options are now available: `volumeMounts`, `volumes`, `envFrom`, and `tolerations`. Here's an example:

```yaml title="Container Spec"
containers:
  resources:
    requests:
      cpu: "2"
      memory: "256Mi"
    
    limits:
      cpu: "4"
      memory: "1Gi"
  
  volumeMounts:
    - name: secret-volume
      mountPath: "/etc/secrets"
      readOnly: true

  envFrom:
    - prefix: APP_
      configMapRef:
        name: app-config
        optional: true
    - secretRef:
        name: app-secret
        optional: true

nodeSelector:
  nodepool: loadtest
  disktype: ssd

tolerations:
  - key: dedicated
    operator: Equal
    value: loadtest
    effect: NoSchedule

volumes:
  - name: secret-volume
    secret:
      secretName: app-secret
```

## Auth Improvements
We provided a bit of flexability for auth configuration. From this version you can enable or disable specific auth provider via `Enable: bool` property in `config.json`.

```json title="config.json"
"Auth": {
    "Enabled": true,    

    "JwtSecret": "YOUR_SECRET_KEY", 

    "StaticUserAuth": {
      // highlight-start
      "Enabled": true,
      // highlight-end
      "Users": [
        {
          "Email": "user_email@test",
          "Hash": "$2a$11$7MTzvj3mTFWVhOryGcDARe9ir0lFc/RPUThoCYBtJWKNff29TPWFC", // password is 'password'
          "UserName": "user"
        }
      ]
    },

    "OpenIDConnect": {
      // highlight-start
      "Enabled": true,
      // highlight-end
      "Authority": "https://accounts.google.com",
      "ClientId": "YOUR_CLIENT_ID",
      "ClientSecret": "YOUR_CLIENT_SECRET",
      "CallbackPath": "/signin-oidc"
    }
  }
```


## UI/UX Improvements

### Auto refresh toggle
This toggle is now available on all views, giving you full control over real-time updates.

<center><img src={NbAutoRefreshImage} width="100%" /></center>

### New Load Test tabs
We added a few new tabs to the load test view: History, Trends, and Schedule. They provide focused navigation and features specific to the selected load test.

<center><img src={NbLoadTestTabsImage} width="100%" /></center>

### License info tooltip
We added a handy license info tooltip that shows your license details, such as company name and expiration date.

<center><img src={NbLicenseInfoImage} width="50%" /></center>

## What's next

- F# Script support
- Follow our [Roadmap](https://github.com/PragmaticFlow/NBomber.Studio/milestone/1) to see what's coming in the next release.