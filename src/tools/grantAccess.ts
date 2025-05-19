import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Wallet } from "ethers";
import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";

export const grantAccess = {
    name: "grant_access",
    description: "Grant access to a protected dataset to a specific app and user",
    inputSchema: {
        type: "object",
        properties: {
            protectedData: { type: "string" },
            authorizedApp: { type: "string" },
            authorizedUser: { type: "string" },
            privateKey: { type: "string" },
        },
        required: ["protectedData", "privateKey", "authorizedApp", "authorizedUser"],
    },
    handler: async (params: any) => {
        const { protectedData, authorizedApp, authorizedUser, privateKey } = params;

        if (
            typeof protectedData !== "string" ||
            typeof authorizedApp !== "string" ||
            typeof authorizedUser !== "string"
        ) {
            throw new McpError(
                ErrorCode.InvalidParams,
                "Parameters protectedData, authorizedApp and authorizedUser must be strings"
            );
        }

        try {
            const signer = new Wallet(privateKey);
            const web3Provider = getWeb3Provider(signer.privateKey);
            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);

            const grantedAccess = await dataProtectorCore.grantAccess({
                protectedData,
                authorizedApp,
                authorizedUser,
            });

            return {
                message: "Access granted to app for protected data",
                grantedAccess,
            };
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
