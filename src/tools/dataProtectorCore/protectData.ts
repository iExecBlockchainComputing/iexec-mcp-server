import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Wallet } from "ethers";
import { readWalletPrivateKey } from "../../utils/readWalletKeystore.js";

export const protectData = {
    name: "protect_data",
    description:
        "Protect any JSON-compatible data using iExec's DataProtector. Encryption is client-side and stored as an NFT.",
    inputSchema: {
        type: "object",
        properties: {
            data: { type: "object" },
            name: { type: "string" },
            allowDebug: { type: "boolean" },
        },
        required: ["data"],
    },
    handler: async (params: any) => {

        const { data, name = "", allowDebug = false } = params;
        if (typeof data !== "object" || Array.isArray(data) || data === null) {
            throw new McpError(ErrorCode.InvalidParams, "Parameter 'data' must be a JSON object");
        }

        try {
            const privateKey = await readWalletPrivateKey();
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
