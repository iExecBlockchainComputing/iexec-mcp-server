import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getIexecProvider } from "../../utils/provider.js";

export const getWalletBalance = {
    name: "get_wallet_balance",
    description: "Get the RLC balance of a wallet address using iExec SDK",
    inputSchema: {
        type: "object",
        properties: {
            wallet: { type: "string" }
        },
        required: ["wallet"],
    },
    handler: async (params: any) => {
        const { wallet } = params;

        if (!wallet || !wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
            throw new McpError(ErrorCode.InvalidParams, "Invalid or missing wallet address");
        }

        try {
            const iexecResponse = await getIexecProvider();
            if (!iexecResponse.success || !iexecResponse.data) {
                throw new Error(iexecResponse.error || "Failed to initialize iExec SDK");
            }

            const iexec = iexecResponse.data.iexec;

            const balance = await iexec.account.checkBalance(wallet);
            const stakeRLC = Number(balance.stake) * 1e-9;
            const lockedRLC = Number(balance.locked) * 1e-9;

            const { nRLC } = await iexec.wallet.checkBalances(wallet);
            const onChainRLC = Number(nRLC) * 1e-9;

            return {
                wallet,
                onChainRLC,
                stakeRLC,
                lockedRLC
            };
        } catch (err: any) {
            console.error("[iExec Plugin] Error fetching balance:", err);
            throw new McpError(ErrorCode.InternalError, "Failed to get wallet balance");
        }
    }
};
