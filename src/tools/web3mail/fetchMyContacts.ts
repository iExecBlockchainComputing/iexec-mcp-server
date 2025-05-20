import { getWeb3Provider, IExecWeb3mail } from "@iexec/web3mail";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Wallet } from "ethers";

export const fetchMyContacts = {
    name: "fetchMyContacts",
    description: "Fetch contacts from web3mail dapp with valid email addresses",
    inputSchema: {
        type: "object",
        properties: {
            privateKey: { type: "string" },
        },
        required: ["privateKey"],
    },
    handler: async (params: any) => {
        const { privateKey } = params;

        if (typeof privateKey !== "string") {
            throw new McpError(ErrorCode.InvalidParams, "privateKey must be a string");
        }

        try {
            const signer = new Wallet(privateKey);
            const web3Provider = getWeb3Provider(signer.privateKey);
            const web3mail = new IExecWeb3mail(web3Provider);

            const contacts = await web3mail.fetchMyContacts();
            return contacts;
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
