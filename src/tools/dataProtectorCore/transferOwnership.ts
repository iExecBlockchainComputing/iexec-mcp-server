import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import {
    getWeb3Provider,
    IExecDataProtectorCore,
} from "@iexec/dataprotector";
import { readWalletPrivateKey } from "../../utils/readWalletKeystore.js";

export const transferOwnership = {
    name: "transfer_ownership",
    description: "Transfer ownership of protected data to a new wallet address",
    inputSchema: {
        type: "object",
        properties: {
            protectedData: { type: "string" },
            newOwner: { type: "string" },
        },
        required: ["protectedData", "newOwner"],
    },
    handler: async (params: any) => {

        const { protectedData, newOwner } = params;

        if (typeof protectedData !== "string" || typeof newOwner !== "string") {
            throw new McpError(
                ErrorCode.InvalidParams,
                "Parameters protectedData and newOwner must be strings"
            );
        }

        try {
            const privateKey = await readWalletPrivateKey();
            const web3Provider = getWeb3Provider(privateKey);
            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);
            const result = await dataProtectorCore.transferOwnership({
                protectedData,
                newOwner,
            });

            return {
                message: "Ownership transferred successfully",
                txHash: result.txHash,
                protectedData: result.address,
                newOwner: result.to,
                explorerUrl: `https://explorer.iex.ec/bellecour/dataset/${result.address}`,
            };
        } catch (error: any) {
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to transfer ownership: ${error.message}`
            );
        }
    },
};
