---
title: NBomber Studio 0.8.2
tags: [nbomber-studio-release, load-testing]
---

**NBomber Studio 0.8.2** is out! This is a patch release focused on stability, with a few valuable fixes: Studio can now run fully air-gapped without reaching out to public CDNs, the Active Sessions table no longer gets stuck showing stale rows, and the C# script validator no longer hangs on large build output.

<!--truncate-->

## Fixes and improvements 

### Air-gapped / offline deployment support
NBomber Studio's UI used to pull a few assets from public CDNs at runtime: the theme stylesheet, jQuery, jQuery Slimscroll, and the Monaco Editor (used for script editing). That made it impossible to run Studio in fully air-gapped or restricted-network environments.

All of these dependencies are now bundled locally into the build:
- `theme.css` is vendored directly into the UI assets instead of being linked from jsDelivr.
- jQuery / Slimscroll `<script>` tags removed from `index.html`.
- Monaco Editor and its language workers (JSON, CSS, HTML, TypeScript) are now bundled via Vite (`monaco-editor` + local worker imports) instead of being loaded from a CDN path.

**Impact:** Studio now works in networks with no outbound internet access.

### Active Sessions table not clearing
Fixed a bug where the "Active Sessions" table would keep showing stale rows after every running session finished — the table never cleared once all sessions left the *Active* state. The polling logic in `ActiveSessionsTable.vue` and the backend `active/lastupdate` endpoint were adjusted so an empty result now correctly refreshes the table instead of being ignored.

### ScriptValidator hang on large build output
The C# script validator could hang indefinitely when a `dotnet build` produced a large amount of stdout/stderr output — synchronous `ReadToEnd()` calls on the process streams could deadlock once the OS pipe buffer filled up. Switched to reading stdout/stderr asynchronously (`ReadToEndAsync`) in parallel with waiting for process exit, eliminating the deadlock.

## 📦 Docker image & Helm chart
NBomber Studio is available as a Docker image and a Helm chart for easy deployment:
- Docker Hub: [nbomberdocker/nbomber-studio](https://hub.docker.com/repository/docker/nbomberdocker/nbomber-studio/general)
- Helm chart: [nbomber-studio](https://artifacthub.io/packages/helm/nbomber-studio/nbomber-studio) ([source](https://github.com/PragmaticFlow/nbomber-studio-helm))

## What's next

- Follow our [Roadmap](https://github.com/PragmaticFlow/NBomber.Studio/milestone/2) to see what's coming in the next release.