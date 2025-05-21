import { getWeb3Provider, IExecWeb3mail } from "@iexec/web3mail";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import 'dotenv/config';

export const fetchMyContacts = {
    name: "fetchMyContacts",
    description: "Fetch contacts from web3mail dapp with valid email addresses",
    inputSchema: {
        type: "object",
        properties: {
        },
    },
    handler: async () => {
        if (!process.env.PRIVATE_KEY) {
            throw new McpError(ErrorCode.InternalError, "Missing PRIVATE_KEY in environment variables");
        }

        try {
            const web3Provider = getWeb3Provider(process.env.PRIVATE_KEY);
            const web3mail = new IExecWeb3mail(web3Provider);
            return await web3mail.fetchMyContacts();
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
