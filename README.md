# n8n Template Explorer MCP

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

```bash
git clone https://github.com/notsointresting/n8n-template-explorer-mcp.git
cd n8n-template-explorer-mcp
npm install
```

## Usage

### With Gemini CLI

Add the following to your Gemini CLI MCP settings file (`~/.gemini/settings.json`):

```json
{
  "mcpServers": {
    "n8n-template-explorer": {
      "command": "node",
      "args": ["/absolute/path/to/n8n-template-explorer-mcp/server.js"]
    }
  }
}
```

### With Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "n8n-template-explorer": {
      "command": "node",
      "args": ["/absolute/path/to/n8n-template-explorer-mcp/server.js"]
    }
  }
}
```

### With VS Code (GitHub Copilot)

Add to your VS Code `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "n8n-template-explorer": {
        "command": "node",
        "args": ["/absolute/path/to/n8n-template-explorer-mcp/server.js"]
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

## License

MIT
