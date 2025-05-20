#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

import { protectData } from "./tools/dataProtectorCore/protectData.js";
import { getUserVoucher } from "./tools/dataProtectorCore/getUserVoucher.js";
import { getWalletBalance } from "./tools/dataProtectorCore/getWalletBalance.js";
import { getProtectedData } from "./tools/dataProtectorCore/getProtectedData.js";
import { transferOwnership } from "./tools/dataProtectorCore/transferOwnership.js";
import { grantAccess } from "./tools/dataProtectorCore/grantAccess.js";
import { revokeOneAccess } from "./tools/dataProtectorCore/revokeOneAccess.js";
import { revokeAllAccess } from "./tools/dataProtectorCore/revokeAllAccess.js";
import { getGrantedAccess } from "./tools/dataProtectorCore/getGrantedAccess.js";
import { processProtectedData } from "./tools/dataProtectorCore/processProtectedData.js";

import { fetchMyContacts } from "./tools/web3mail/fetchMyContacts.js";
import { fetchUserContacts } from "./tools/web3mail/fetchUserContacts.js";
import { sendEmail } from "./tools/web3mail/sendEmail.js";

import { getIExecApps } from "./tools/getIExecApps.js";


fetchMyContacts

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

const tools = [protectData, getProtectedData, processProtectedData, getIExecApps, transferOwnership, grantAccess, getGrantedAccess, revokeOneAccess, sendEmail, revokeAllAccess, fetchUserContacts, fetchMyContacts, getUserVoucher, getWalletBalance];

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
