---
id: grafana
title: Grafana
sidebar_position: 1
---

Grafana is an open-source platform for monitoring and observability. It allows you to visualize your load testing results and be able to query historical data for further analyses in the future. Grafana is commonly used in conjunction with time-series databases: [InfluxDB](influx-db).

To work with Grafana, NBomber provides dashboards that should be imported to display load test stats
- [NBomber Sessions Dashboard](https://github.com/PragmaticFlow/NBomber.Grafana/blob/main/nbomber_sessions_board.json) - This dashboard displays a list of NBomber sessions that you can open for further analysis.
- [NBomber Dashboard](https://github.com/PragmaticFlow/NBomber.Grafana/blob/main/nbomber_board.json) - This dashboard displays concrete load test statistics.

<center><iframe width="80%" height="400" src="https://www.youtube.com/embed/US_zgCYP0lE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></center>

## Installation

For local development, we recommend installing Grafana via [Docker](https://docs.docker.com/engine/install/). In [this example](https://github.com/PragmaticFlow/NBomber/blob/dev/examples/Demo/Features/RealtimeReporting/InfluxDB/docker-compose.yaml) you will find a docker-compose with Grafana + InfluxDB.

To run the docker-compose file, please open the folder with the file and run the following command:

```
docker compose up -d
```

In this following video, you will find how to connect InfluxDB with Grafana and import NBomber Grafana dashboards.

<center><iframe width="80%" height="400" src="https://www.youtube.com/embed/3-Llhl8_Onc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></center>