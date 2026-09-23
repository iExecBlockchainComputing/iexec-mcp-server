import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Wallet } from "ethers";
import { readWalletPrivateKey } from "../../utils/readWalletKeystore.js";
import { chain, getExplorerDatasetUrl } from "../../utils/chain.js";

export const protectData = {
    name: "protect_data",
    description:
        "Protect any JSON-compatible data using iExec's DataProtector. Encryption is client-side and stored as an NFT.",
    inputSchema: {
        type: "object",
        properties: {
            data: { type: "object" },
            name: { type: "string" },
        },
        required: ["data"],
    },
    handler: async (params: any) => {

        const { data, name = "" } = params;
        if (typeof data !== "object" || Array.isArray(data) || data === null) {
            throw new McpError(ErrorCode.InvalidParams, "Parameter 'data' must be a JSON object");
        }

        try {
            const privateKey = await readWalletPrivateKey();
            const signer = new Wallet(privateKey);
            const web3Provider = getWeb3Provider(signer.privateKey, chain.name);
            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);

            const protectedData = await dataProtectorCore.protectData({
                name,
                data,
                onStatusUpdate: ({ title, isDone }: { title: string; isDone: boolean }) => {
                    console.error(`Status: ${title}, done: ${isDone}`);
                },
            });

            return {
                message: "Data protected successfully",
                protectedDataUrl: getExplorerDatasetUrl(protectedData.address),
                protectedData,
                owner: signer.address
            };
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message || "Unknown error");
        }
    }
};
