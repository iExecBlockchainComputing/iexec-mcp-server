import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getIexecProvider } from "../../utils/provider.js";
import { readWalletPrivateKey } from "../../utils/readWalletKeystore.js";
import { chain } from "../../utils/chain.js";
import { Wallet, formatEther } from "ethers";

export const getWalletBalance = {
    name: "get_wallet_balance",
    description: "Get the ETH (gas) and RLC balances of the configured wallet on the current Arbitrum network",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string" }
        },
        required: [],
    },
    handler: async () => {
        const privateKey = await readWalletPrivateKey();
        const wallet = new Wallet(privateKey);

        try {
            const iexecResponse = await getIexecProvider();
            if (!iexecResponse.success || !iexecResponse.data) {
                throw new Error(iexecResponse.error || "Failed to initialize iExec SDK");
            }

            const iexec = iexecResponse.data.iexec;

            const balance = await iexec.account.checkBalance(wallet.address);
            const stakeRLC = Number(balance.stake) * 1e-9;
            const lockedRLC = Number(balance.locked) * 1e-9;

            const { wei, nRLC } = await iexec.wallet.checkBalances(wallet.address);
            const onChainETH = Number(formatEther(wei.toString()));
            const onChainRLC = Number(nRLC) * 1e-9;

            return {
                wallet: wallet.address,
                chain: chain.name,
                onChainETH,
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
