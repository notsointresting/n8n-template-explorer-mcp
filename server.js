import axios from "axios";
import { z } from "zod";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

const N8N_API = "https://api.n8n.io/api/templates";

// Zod schemas
const SearchInputSchema = z.object({
  query: z.string().min(1, "Query must not be empty")
});

const WorkflowIdSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String)
    .refine((v) => /^\d+$/.test(v), "Must be a numeric workflow ID")
});

// Create MCP server
const server = new Server(
  { name: "n8n-template-explorer", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// LIST TOOLS
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_workflows",
      description: "Search n8n workflow templates from the n8n.io website. Returns matching workflows with their ID, title, description, and URL.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search term (e.g. 'gmail', 'slack', 'AI agent')" }
        },
        required: ["query"]
      }
    },
    {
      name: "get_workflow_details",
      description: "Fetch full details about a specific n8n workflow by its numeric ID.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Numeric workflow ID (e.g. '1234')" }
        },
        required: ["id"]
      }
    },
    {
      name: "download_workflow_json",
      description: "Download the importable JSON definition of an n8n workflow by its numeric ID.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Numeric workflow ID (e.g. '1234')" }
        },
        required: ["id"]
      }
    }
  ]
}));

function errorResponse(message) {
  return { content: [{ type: "text", text: JSON.stringify({ error: message }) }], isError: true };
}

// TOOL EXECUTION
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // --- search_workflows ---
  if (name === "search_workflows") {
    const parsed = SearchInputSchema.safeParse(args);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const query = parsed.data.query;

    try {
      const response = await axios.get(`${N8N_API}/search`, {
        params: { rows: 15, search: query },
        timeout: 15000
      });

      const workflows = (response.data.workflows || []).map((w) => ({
        id: w.id,
        title: w.name,
        description: (w.description || "").slice(0, 200),
        url: `https://n8n.io/workflows/${w.id}`,
        totalViews: w.totalViews,
        categories: w.categories || []
      }));

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            total: response.data.totalWorkflows,
            showing: workflows.length,
            workflows
          }, null, 2)
        }]
      };
    } catch (err) {
      return errorResponse(`Failed to search workflows: ${err.message}`);
    }
  }

  // --- get_workflow_details ---
  if (name === "get_workflow_details") {
    const parsed = WorkflowIdSchema.safeParse(args);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const id = parsed.data.id;

    try {
      const response = await axios.get(`${N8N_API}/workflows/${id}`, { timeout: 15000 });
      const w = response.data.workflow;

      const details = {
        id: w.id,
        title: w.name,
        description: w.description || "No description",
        url: `https://n8n.io/workflows/${w.id}`,
        nodes: (w.nodes || []).map((n) => n.type),
        createdAt: w.createdAt
      };

      return {
        content: [{ type: "text", text: JSON.stringify(details, null, 2) }]
      };
    } catch (err) {
      if (err.response?.status === 404) return errorResponse(`Workflow ${id} not found.`);
      return errorResponse(`Failed to fetch workflow details: ${err.message}`);
    }
  }

  // --- download_workflow_json ---
  if (name === "download_workflow_json") {
    const parsed = WorkflowIdSchema.safeParse(args);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const id = parsed.data.id;

    try {
      const response = await axios.get(`${N8N_API}/workflows/${id}`, { timeout: 15000 });
      const w = response.data.workflow;

      // Build the importable workflow JSON
      const workflowJson = {
        name: w.name,
        nodes: w.nodes,
        connections: w.connections,
        settings: w.settings || {}
      };

      return {
        content: [{ type: "text", text: JSON.stringify(workflowJson, null, 2) }]
      };
    } catch (err) {
      if (err.response?.status === 404) return errorResponse(`Workflow ${id} not found.`);
      return errorResponse(`Failed to download workflow JSON: ${err.message}`);
    }
  }

  return errorResponse(`Unknown tool: ${name}`);
});

// Start MCP server
const transport = new StdioServerTransport();
await server.connect(transport);