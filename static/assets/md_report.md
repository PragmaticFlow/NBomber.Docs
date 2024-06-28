> test info

test suite: `nbomber_default_test_suite_name`

test name: `nbomber_default_test_name`

session id: `2024-06-27_07.51.42_session_ccf412f0`

> scenario stats

scenario: `http_scenario`

  - ok count: `18030`

  - fail count: `0`

  - all data: `879.3` MB

  - duration: `00:03:00`

load simulations:

  - `ramping_inject`, rate: `150`, interval: `00:00:01`, during: `00:01:00`

  - `inject`, rate: `150`, interval: `00:00:01`, during: `00:01:00`

  - `ramping_inject`, rate: `0`, interval: `00:00:01`, during: `00:01:00`

|step|ok stats|
|---|---|
|name|`global information`|
|request count|all = `18030`, ok = `18030`, RPS = `100.2`|
|latency|min = `33.23` ms, mean = `133.8` ms, max = `1728.73` ms, StdDev = `104.41`|
|latency percentile|p50 = `109.82` ms, p75 = `139.01` ms, p95 = `380.67` ms, p99 = `563.2` ms|
|data transfer|min = `49.936` KB, mean = `49.952` KB, max = `49.94` KB, all = `879.3` MB|


> status codes for scenario: `http_scenario`

|status code|count|message|
|---|---|---|
|OK|18030||


> plugin stats: `Ping Plugin`

|Host|Status|Address|Round Trip Time|Time to Live|Don't Fragment|Buffer Size|
|---|---|---|---|---|---|---|
|nbomber.com|Success|104.248.140.128|37 ms|128|False|32 bytes|


