import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getIexecProvider } from "../../utils/provider.js";
import { readWalletPrivateKey } from "../../utils/readWalletKeystore.js";
import { Wallet } from "ethers";

export const getUserVoucher = {
    name: "get_user_voucher",
    description: "Get the user's iExec voucher information (balance, expiration, sponsors, etc.)",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string" },
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

            const userVoucher = await iexec.voucher.showUserVoucher(wallet.address);

            return {
                address: userVoucher.address,
                balance: userVoucher.balance,
                expirationTimestamp: userVoucher.expirationTimestamp,
                sponsoredApps: userVoucher.sponsoredApps,
                sponsoredDatasets: userVoucher.sponsoredDatasets,
                sponsoredWorkerpools: userVoucher.sponsoredWorkerpools,
                allowanceAmount: userVoucher.allowanceAmount,
                authorizedAccounts: userVoucher.authorizedAccounts,
            };
        } catch (error: any) {
            if (error.message.includes("No Voucher found")) {
                return {
                    message: `No voucher found for wallet ${wallet.address}. Go to iExec discord to claim your voucher: https://discord.com/invite/aXH5ym5H4k`
                };
            }
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    }
};
