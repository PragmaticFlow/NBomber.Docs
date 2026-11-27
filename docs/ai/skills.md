---
id: skills
title: AI Skills
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[NBomber AI Skills](https://github.com/PragmaticFlow/NBomber.AI.Skills) are [Agent Skills](https://agentskills.io) for NBomber. They give your AI coding agent the NBomber knowledge that it needs to write correct load tests, and to review the tests that you already have.

The skills use the open `SKILL.md` format. They work with any AI coding agent that supports Agent Skills, for example Claude Code, Codex, Cursor or GitHub Copilot.

## Why you need them

An AI agent can write an NBomber test in seconds. But a load test that compiles is not always a load test that produces the correct load and measures the correct thing. The skills contain proven solutions and patterns for common problems. When your request matches a skill, the agent loads its full instructions and uses them to fix or improve your load test. The skills can also help you migrate to a newer version of the NBomber API or start using recently released features.

## Available skills

| Skill | What it does |
|---|---|
| <span style={{whiteSpace: 'nowrap'}}>[**nb-core**](https://github.com/PragmaticFlow/NBomber.AI.Skills/blob/dev/skills/nb-core/SKILL.md)</span> | Writes and reviews any NBomber test, for any protocol. It checks the basic setup, such as GC settings and warm-up. |
| <span style={{whiteSpace: 'nowrap'}}>[**nb-http**](https://github.com/PragmaticFlow/NBomber.AI.Skills/blob/dev/skills/nb-http/SKILL.md)</span> | Writes and reviews NBomber HTTP scenarios, and checks them against common HTTP patterns. |

## Installation

:::info
Prerequisites

- An AI coding agent that supports Agent Skills, for example Claude Code, Codex, Cursor or GitHub Copilot.
- [Node.js](https://nodejs.org) 22.20 or later, for the `skills` CLI.
:::

Each agent reads skills from its own `skills` folder. The easiest way to put the skills there is the [skills.sh](https://skills.sh) CLI. You can also copy the folders by hand.

### With skills.sh (recommended)

Run this command **from the root folder of your project** (the folder that you open your agent in):

```bash
npx skills add PragmaticFlow/NBomber.AI.Skills
```

To see the skills in the repo without installing them, add `--list`:

```bash
npx skills add PragmaticFlow/NBomber.AI.Skills --list
```

### Check the install

1. Start a new agent session, or restart the agent, so that it finds the new skills.
2. Ask the agent which skills it has. The list should include `nb-core` and `nb-http`.

## Usage

The skills work in two modes:

- **Writing a test.** The agent makes the new code pass every check.
- **Reviewing a test.** The agent goes through every check, and reports each one as passed or failed. For each failed check, it gives the file and the line, explains the problem, and proposes the exact change. **The agent does not change your code until you agree.**

## Update or remove the skills

We improve the skills together with NBomber. If you installed the skills with skills.sh, use these commands:

| Command | What it does |
|---|---|
| `npx skills check` | Checks whether updates are available. |
| `npx skills update` | Updates the installed skills. |
| `npx skills remove nb-core nb-http` | Removes the skills. |

## Feedback

The skills are open source under the [MIT license](https://github.com/PragmaticFlow/NBomber.AI.Skills/blob/dev/LICENSE). If the agent gives you incorrect advice, or you have an idea for a new check, open an issue on [GitHub](https://github.com/PragmaticFlow/NBomber.AI.Skills/issues).
