import { getWeb3Provider, IExecWeb3mail, WorkflowError } from "@iexec/web3mail";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { readWalletPrivateKey } from "../../utils/readWalletKeystore.js";

export const fetchMyContacts = {
    name: "fetchMyContacts",
    description: "Fetch contacts from web3mail dapp with valid email addresses",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string" },
        },
        required: [],
    },
    handler: async () => {
        try {
            const privateKey = await readWalletPrivateKey();
            const web3Provider = getWeb3Provider(privateKey);
            const web3mail = new IExecWeb3mail(web3Provider);
            const contacts = await web3mail.fetchMyContacts({ isUserStrict: true }
            );
            return {
                message: "Contacts fetched successfully",
                contacts
            };
        } catch (error: any) {
            if (error instanceof WorkflowError) {
                if (error.isProtocolError) {
                    throw new McpError(ErrorCode.InternalError, error.message);
                } else {
                    throw new McpError(ErrorCode.InvalidParams, error.message);
                }
            }
            throw new McpError(ErrorCode.InternalError, error.message);

        }
    },
};
