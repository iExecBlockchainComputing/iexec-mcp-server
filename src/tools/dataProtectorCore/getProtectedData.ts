import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Wallet } from "ethers";
import {
    getWeb3Provider,
    IExecDataProtectorCore,
} from "@iexec/dataprotector";

export const getProtectedData = {
    name: "get_protected_data",
    description:
        "Retrieve protected data using iExec DataProtector. You can optionally filter by wallet or schema.",
    inputSchema: {
        type: "object",
        properties: {
            wallet: { type: "string" },
            requiredSchema: { type: "object" },
        },
        required: ["wallet"],
    },
    handler: async (params: any) => {
        
        const { wallet, requiredSchema } = params;

        if (typeof wallet !== "string") {
            throw new McpError(ErrorCode.InvalidParams, "wallet must be a string");
        }

        try {
            const walletInstance = Wallet.createRandom();
            const web3Provider = getWeb3Provider(walletInstance.privateKey);

            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);

            const protectedDataList = await dataProtectorCore.getProtectedData({
                owner: wallet,
                ...(requiredSchema && { requiredSchema }),
            });

            return {
                count: protectedDataList.length,
                protectedData: protectedDataList.map((data: any) => ({
                    name: data.name,
                    address: data.address,
                    schema: data.schema,
                    owner: data.owner,
                    timestamp: data.timestamp,
                    url: `https://explorer.iex.ec/bellecour/dataset/${data.address}`,
                })),
            };
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
