# n8n Template Explorer MCP

[![npm version](https://img.shields.io/npm/v/n8n-template-explorer-mcp)](https://www.npmjs.com/package/n8n-template-explorer-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that lets AI agents search, explore, and download workflow templates from the [n8n workflow library](https://n8n.io/workflows/).

## Tools

| Tool | Description |
|------|-------------|
| `search_workflows` | Search n8n workflow templates by keyword (e.g. "gmail", "slack", "AI agent") |
| `get_workflow_details` | Get full details of a specific workflow by its numeric ID |
| `download_workflow_json` | Download the importable JSON definition of a workflow by its numeric ID |

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- npm

## Installation

### Quick (npx — no install needed)

Just add the config below to your MCP client. It runs automatically via `npx`.

### Manual (from source)

```bash
git clone https://github.com/notsointresting/n8n-template-explorer-mcp.git
cd n8n-template-explorer-mcp
npm install
```

## Usage

### With Gemini CLI

Add to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "n8n-template-explorer": {
      "command": "npx",
      "args": ["n8n-template-explorer-mcp"]
    }
  }
}
```

### With Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "n8n-template-explorer": {
      "command": "npx",
      "args": ["n8n-template-explorer-mcp"]
    }
  }
}
```

### With VS Code (GitHub Copilot)

Add to VS Code `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "n8n-template-explorer": {
        "command": "npx",
        "args": ["n8n-template-explorer-mcp"]
      }
    }
  }
}
```

### With MCP Inspector

```bash
npx @modelcontextprotocol/inspector node server.js
```

> **Note (Windows):** If the default ports conflict with Hyper-V reserved ranges, set custom ports:
> ```bash
> CLIENT_PORT=3100 SERVER_PORT=3101 npx @modelcontextprotocol/inspector node server.js
> ```

## Example Tool Calls

### Search workflows

```json
{
  "name": "search_workflows",
  "arguments": { "query": "gmail" }
}
```

Response:

```json
{
  "total": 1730,
  "showing": 15,
  "workflows": [
    {
      "id": 6287,
      "title": "Email Support Agent w/ Gemini & GPT fallback using Gmail + Google Sheets",
      "description": "...",
      "url": "https://n8n.io/workflows/6287",
      "totalViews": 12345,
      "categories": ["AI"]
    }
  ]
}
```

### Get workflow details

```json
{
  "name": "get_workflow_details",
  "arguments": { "id": "6287" }
}
```

### Download workflow JSON

```json
{
  "name": "download_workflow_json",
  "arguments": { "id": "6287" }
}
```

Returns the full workflow JSON with `name`, `nodes`, `connections`, and `settings` — ready to import into your n8n instance.

## How It Works

This server uses the [n8n public templates API](https://api.n8n.io/api/templates/search) to fetch workflow data. No API key or authentication is required — it accesses the same public data available on the n8n workflows website.

## Tech Stack

- **Runtime:** Node.js (ES modules)
- **MCP SDK:** [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- **Transport:** StdioServerTransport
- **HTTP client:** [axios](https://www.npmjs.com/package/axios)
- **Validation:** [zod](https://www.npmjs.com/package/zod)

## Disclaimer

This is an **unofficial, community-built** project and is not affiliated with, endorsed by, or sponsored by [n8n GmbH](https://n8n.io/). "n8n" is a trademark of n8n GmbH.

This server accesses n8n's publicly available templates API — the same data visible on [n8n.io/workflows](https://n8n.io/workflows/). No private data, authentication tokens, or proprietary code is used.

## License

MIT
