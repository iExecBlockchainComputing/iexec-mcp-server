import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";
import 'dotenv/config';

export const getGrantedAccess = {
    name: "get_granted_access",
    description: "List granted access permissions for a protected dataset",
    inputSchema: {
        type: "object",
        properties: {
            protectedData: { type: "string" },
            authorizedApp: { type: "string" },
            authorizedUser: { type: "string" },
            isUserStrict: { type: "boolean" },
            page: { type: "number", minimum: 0 },
            pageSize: { type: "number", minimum: 10, maximum: 1000 },
        },
        required: [],
    },
    handler: async (params: any) => {
        const privateKey = process.env.PRIVATE_KEY as string;

        if (!privateKey) {
            throw new McpError(ErrorCode.InternalError, "Missing PRIVATE_KEY in environment variables");
        }
        const { protectedData, authorizedApp, authorizedUser } = params;

        try {
            const web3Provider = getWeb3Provider(privateKey);
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
