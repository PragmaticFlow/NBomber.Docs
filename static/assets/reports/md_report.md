> test info

test suite: `nbomber_default_test_suite_name`

test name: `nbomber_default_test_name`

session id: `2024-06-28_11.34.95_session_a43e988b`

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
|latency (ms)|min = `32.85`, mean = `134.59`, max = `2750.7`, StdDev = `117.1`|
|latency percentile (ms)|p50 = `108.48`, p75 = `139.52`, p95 = `388.1`, p99 = `584.7`|
|data transfer (KB)|min = `49.936`, mean = `49.952`, max = `49.94`, all = `879.3` MB|


> status codes for scenario: `http_scenario`

|status code|count|message|
|---|---|---|
|OK|18030||


> plugin stats: `Ping Plugin`

|Host|Status|Address|Round Trip Time|Time to Live|Don't Fragment|Buffer Size|
|---|---|---|---|---|---|---|
|nbomber.com|Success|104.248.140.128|37 ms|128|False|32 bytes|


