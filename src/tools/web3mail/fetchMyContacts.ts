import { getWeb3Provider, IExecWeb3mail } from "@iexec/web3mail";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { readWalletPrivateKey } from "../../utils/readWalletKeystore.js";

export const fetchMyContacts = {
    name: "fetchMyContacts",
    description: "Fetch contacts from web3mail dapp with valid email addresses",
    inputSchema: {
        type: "object",
        properties: {
        },
    },
    handler: async () => {
        try {
            const privateKey = await readWalletPrivateKey();
            const web3Provider = getWeb3Provider(privateKey);
            const web3mail = new IExecWeb3mail(web3Provider);
            return await web3mail.fetchMyContacts();
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
