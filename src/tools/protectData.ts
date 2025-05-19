import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Wallet } from "ethers";
import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";

export const protectData = {
    name: "protect_data",
    description: "Protect data using iExec DataProtector and confidential computing",
    inputSchema: {
        type: "object",
        properties: {
            text: { type: "string" },
            wallet: { type: "string" }, // Required if no privateKey is provided
            privateKey: { type: "string" }, // Optional
        },
        required: ["text"],
    },
    handler: async (params: any) => {
        const { text, wallet, privateKey } = params;

        if (typeof text !== "string") {
            throw new McpError(ErrorCode.InvalidParams, "Parameter 'text' must be a string");
        }

        const useProvidedKey = typeof privateKey === "string" && privateKey.trim() !== "";

        if (!useProvidedKey && (typeof wallet !== "string" || wallet.trim() === "")) {
            throw new McpError(ErrorCode.InvalidParams, "Must provide either 'privateKey' or 'wallet'");
        }

        try {
            const signer = useProvidedKey ? new Wallet(privateKey) : Wallet.createRandom();
            const web3Provider = getWeb3Provider(signer.privateKey);
            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);

            const protectedData = await dataProtectorCore.protectData({
                name: "MCP Data Protection",
                data: { content: text },
            });

            if (!useProvidedKey && wallet) {
                await dataProtectorCore.transferOwnership({
                    protectedData: protectedData.address,
                    newOwner: wallet,
                });
            }

            return {
                message: "Data has been protected",
                protectedDataUrl: `https://explorer.iex.ec/bellecour/dataset/${protectedData.address}`,
                ...(useProvidedKey
                    ? { owner: signer.address }
                    : {
                        createdBy: signer.address,
                        transferredTo: wallet,
                    }),
            };
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
