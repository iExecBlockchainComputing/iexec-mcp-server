import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import {
    IExecDataProtectorCore,
} from "@iexec/dataprotector";
import 'dotenv/config';

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
        if (!process.env.PRIVATE_KEY) {
            throw new McpError(ErrorCode.InternalError, "Missing PRIVATE_KEY in environment variables");
        }
        const { protectedData, newOwner } = params;

        if (typeof protectedData !== "string" || typeof newOwner !== "string") {
            throw new McpError(
                ErrorCode.InvalidParams,
                "Parameters protectedData and newOwner must be strings"
            );
        }

        try {
            const dataProtectorCore = new IExecDataProtectorCore(process.env.PRIVATE_KEY);
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
