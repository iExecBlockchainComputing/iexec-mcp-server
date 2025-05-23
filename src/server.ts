import express from 'express';
import type { Request, Response } from 'express';
import {
    Server
} from "@modelcontextprotocol/sdk/server/index.js";
import {
    StdioServerTransport
} from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    SSEServerTransport
} from "@modelcontextprotocol/sdk/server/sse.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

// Import all tools
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

const tools = [
    protectData,
    getProtectedData,
    processProtectedData,
    getIExecApps,
    transferOwnership,
    grantAccess,
    getGrantedAccess,
    revokeOneAccess,
    sendEmail,
    revokeAllAccess,
    fetchUserContacts,
    fetchMyContacts,
    getUserVoucher,
    getWalletBalance,
];

export async function startServer(): Promise<void> {
    const remote = process.env.REMOTE ?? "false";
    const port = process.env.PORT ?? 3000;

    const server = new Server(
        {
            name: "iexec-mcp-server",
            version: "1.0.0",
        },
        {
            capabilities: {
                resources: {},
                tools: {},
            },
        }
    );

    // Register tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: tools.map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema,
        })),
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
        const tool = tools.find((t) => t.name === request.params.name);
        if (!tool) {
            throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
        }
        const result = await tool.handler(request.params.arguments);
        return { toolResult: result };
    });

    if (remote === "true") {
        const app = express();
        app.use(express.json());

        const transports = new Map<string, SSEServerTransport>();

        app.get('/sse', async (req: Request, res: Response) => {
            try {
                const transport = new SSEServerTransport('/messages', res);
                const sessionId = transport.sessionId;

                transports.set(sessionId, transport);
                console.log(`SSE client connected: ${sessionId}`);

                req.on('close', () => {
                    console.log(`SSE client disconnected: ${sessionId}`);
                    transports.delete(sessionId);
                });

                await server.connect(transport);

                await server.sendLoggingMessage({
                    level: 'info',
                    data: { message: 'iExec MCP server started with SSE transport...' },
                });
            } catch (error) {
                console.error('Error handling SSE connection:', error);
                res.status(500).send('Error establishing SSE connection');
            }
        });

        app.post('/messages', async (req, res) => {
            try {
                const sessionId = req.query.sessionId as string;
                if (!sessionId) {
                    res.status(400).send('Missing sessionId parameter');
                    return;
                }

                const transport = transports.get(sessionId);
                if (!transport) {
                    res.status(400).json({ error: 'No active SSE connection found' });
                    return;
                }

                await transport.handlePostMessage(req, res, req.body);
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to process message',
                    message: error instanceof Error ? error.message : String(error),
                });
            }
        });

        app.listen(port, () => {
            console.log(`iExec MCP server listening on port ${port}`);
            console.log(`SSE endpoint: http://localhost:${port}/sse`);
            console.log(`Message endpoint: http://localhost:${port}/messages`);
        });
    } else {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error('iExec MCP server started with stdio transport...');
    }
}
