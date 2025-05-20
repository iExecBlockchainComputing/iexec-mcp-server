import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Wallet } from "ethers";

export const protectData = {
    name: "protect_data",
    description:
        "Protect any JSON-compatible data using iExec's DataProtector. Encryption is client-side and stored as an NFT.",
    inputSchema: {
        type: "object",
        properties: {
            data: { type: "object" },              // Required: JSON object to protect
            name: { type: "string" },              // Optional: Public name for the protected data
            wallet: { type: "string" },            // Optional: Destination wallet for transfer
            privateKey: { type: "string" },        // Optional: If user owns the data directly
            allowDebug: { type: "boolean" },       // Optional: Enable for dev/testing
        },
        required: ["data"],
    },
    handler: async (params: any) => {
        const { data, name = "", wallet, privateKey, allowDebug = false } = params;

        const hasPrivateKey = typeof privateKey === "string" && privateKey.trim() !== "";
        const hasWallet = typeof wallet === "string" && wallet.trim() !== "";

        if (!hasPrivateKey && !hasWallet) {
            throw new McpError(ErrorCode.InvalidParams, "You must provide either a 'privateKey' or a destination 'wallet'");
        }

        if (typeof data !== "object" || Array.isArray(data) || data === null) {
            throw new McpError(ErrorCode.InvalidParams, "Parameter 'data' must be a JSON object");
        }

        try {
            const signer = hasPrivateKey ? new Wallet(privateKey) : Wallet.createRandom();
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

            if (!hasPrivateKey && hasWallet) {
                await dataProtectorCore.transferOwnership({
                    protectedData: protectedData.address,
                    newOwner: wallet,
                });
            }

            return {
                message: "Data protected successfully",
                protectedDataUrl: `https://explorer.iex.ec/bellecour/dataset/${protectedData.address}`,
                protectedData,
                ...(hasPrivateKey
                    ? { owner: signer.address }
                    : {
                        createdBy: signer.address,
                        transferredTo: wallet,
                    }),
            };
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message || "Unknown error");
        }
    }

};
