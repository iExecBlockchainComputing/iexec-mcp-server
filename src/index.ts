#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

import { protectData } from "./tools/protectData.js";
import { getUserVoucher } from "./tools/getUserVoucher.js";
import { getWalletBalance } from "./tools/getWalletBalance.js";
import { getProtectedData } from "./tools/getProtectedData.js";
import { transferOwnership } from "./tools/transferOwnership.js";
import { grantAccess } from "./tools/grantAccess.js";
import { revokeOneAccess } from "./tools/revokeOneAccess.js";
import { revokeAllAccess } from "./tools/revokeAllAccess.js";
import { getGrantedAccess } from "./tools/getGrantedAccess.js";
import { processProtectedData } from "./tools/processProtectedData.js";


const server = new Server(
    {
        name: "iexec-mcp-local-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            resources: {},
            tools: {},
        },
    }
);

const tools = [protectData, getProtectedData, processProtectedData, transferOwnership, grantAccess, getGrantedAccess, revokeOneAccess, revokeAllAccess, getUserVoucher, getWalletBalance];

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: tools.map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema,
        })),
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    const tool = tools.find((t) => t.name === request.params.name);
    if (!tool) {
        throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
    }

    // appelle le handler de l'outil avec les arguments
    const result = await tool.handler(request.params.arguments);
    return { toolResult: result };
});

async function main() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("Server started and listening on stdio");
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

main();
