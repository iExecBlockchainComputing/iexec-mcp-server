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
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
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
                resources: {
                    "iexec-docs://": {
                        description: "Documentation iExec officielle - Guides, tutoriels et références",
                        schema: {
                            type: "object",
                            properties: {
                                content: {
                                    type: "string",
                                    description: "Contenu du document en Markdown"
                                },
                                mimeType: {
                                    type: "string",
                                    description: "Type MIME du document (text/markdown)"
                                }
                            }
                        }
                    }
                },
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

    // Register resources
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        try {
            const { readdir, stat } = await import('fs/promises');
            const { resolve, join } = await import('path');

            const docsPath = resolve('./documentation');
            const resources: any[] = [];

            // Fonction récursive pour scanner la documentation
            async function scanDocs(dir: string, prefix: string = '') {
                const items = await readdir(dir);

                for (const item of items) {
                    if (item.startsWith('.') || item === 'node_modules' || item === 'build' || item === 'dist') {
                        continue;
                    }

                    const fullPath = join(dir, item);
                    const stats = await stat(fullPath);
                    const relativePath = prefix ? `${prefix}/${item}` : item;

                    if (stats.isDirectory()) {
                        await scanDocs(fullPath, relativePath);
                    } else if (item.endsWith('.md')) {
                        resources.push({
                            uri: `iexec-docs://${relativePath}`,
                            name: item.replace('.md', ''),
                            description: `Documentation iExec: ${relativePath}`,
                            mimeType: 'text/markdown'
                        });
                    }
                }
            }

            await scanDocs(docsPath);

            return { resources };
        } catch (error) {
            console.error('Erreur lors de la liste des ressources:', error);
            return { resources: [] };
        }
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
        try {
            const uri = request.params.uri;

            if (uri.startsWith('iexec-docs://')) {
                const filePath = uri.replace('iexec-docs://', '');
                const { readFile } = await import('fs/promises');
                const { resolve, join } = await import('path');

                const docsPath = resolve('./documentation');
                const fullPath = join(docsPath, filePath);

                // Vérifier que le fichier est dans le dossier de documentation
                if (!fullPath.startsWith(docsPath)) {
                    throw new McpError(ErrorCode.InvalidRequest, 'Accès non autorisé');
                }

                const content = await readFile(fullPath, 'utf-8');

                return {
                    contents: [{
                        uri,
                        mimeType: 'text/markdown',
                        text: content
                    }]
                };
            }

            throw new McpError(ErrorCode.InvalidRequest, 'Ressource non trouvée');
        } catch (error) {
            if (error instanceof McpError) {
                throw error;
            }
            throw new McpError(ErrorCode.InternalError, `Erreur lors de la lecture de la ressource: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
        const tool = tools.find((t) => t.name === request.params.name);
        if (!tool) {
            throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
        }
        const result = await tool.handler(request.params.arguments);
        return {
            content: [
                {
                    type: "text",
                    text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                }
            ]
        };
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
