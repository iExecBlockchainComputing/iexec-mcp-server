import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Wallet } from "ethers";
import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";

export const getGrantedAccess = {
    name: "get_granted_access",
    description: "List granted access permissions for a protected dataset",
    inputSchema: {
        type: "object",
        properties: {
            protectedData: { type: "string" },
            authorizedApp: { type: "string" },
            authorizedUser: { type: "string" },
            privateKey: { type: "string" },
        },
        required: ["privateKey"],
    },
    handler: async (params: any) => {
        const { protectedData, authorizedApp, authorizedUser, privateKey } = params;

        try {
            const signer = new Wallet(privateKey);
            const web3Provider = getWeb3Provider(signer.privateKey);
            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);

            const query = {
                ...(protectedData && { protectedData }),
                ...(authorizedApp && { authorizedApp }),
                ...(authorizedUser && { authorizedUser }),
            };

            const granted = await dataProtectorCore.getGrantedAccess(query);

            return {
                count: granted.count,
                grantedAccess: granted.grantedAccess,
            };
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
