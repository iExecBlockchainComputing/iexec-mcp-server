import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Wallet } from "ethers";
import { z } from "zod";
import 'dotenv/config';

export const protectData = {
    name: "protect_data",
    description:
        "Protect any JSON-compatible data using iExec's DataProtector. Encryption is client-side and stored as an NFT.",
    inputSchema: {
        type: "object",
        properties: {
            data: { type: "object" },              // Required: JSON object to protect
            name: { type: "string" },              // Optional: Public name for the protected data
            allowDebug: { type: "boolean" },       // Optional: Enable for dev/testing
        },
        required: ["data"],
    },
    handler: async (params: any) => {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new McpError(ErrorCode.InternalError, "Missing PRIVATE_KEY in environment variables");
        }
        const { data, name = "", allowDebug = false } = params;
        if (typeof data !== "object" || Array.isArray(data) || data === null) {
            throw new McpError(ErrorCode.InvalidParams, "Parameter 'data' must be a JSON object");
        }

        try {
            const signer = new Wallet(privateKey);
            const web3Provider = getWeb3Provider(signer.privateKey);
            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);

            const protectedData = await dataProtectorCore.protectData({
                name,
                data,
                allowDebug,
                onStatusUpdate: ({ title, isDone }: { title: string; isDone: boolean }) => {
                    console.error(`Status: ${title}, done: ${isDone}`);
                },
            });

            return {
                message: "Data protected successfully",
                protectedDataUrl: `https://explorer.iex.ec/bellecour/dataset/${protectedData.address}`,
                protectedData,
                owner: signer.address
            };
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message || "Unknown error");
        }
    }
};
