import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getIexecProvider } from "../../utils/provider.js";

export const getUserVoucher = {
    name: "get_user_voucher",
    description: "Get the user's iExec voucher information (balance, expiration, sponsors, etc.)",
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

            const userVoucher = await iexec.voucher.showUserVoucher(wallet);

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
                    message: `No voucher found for wallet ${wallet}. Go to iExec discord to claim your voucher: https://discord.com/invite/aXH5ym5H4k`
                };
            }
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    }
};
