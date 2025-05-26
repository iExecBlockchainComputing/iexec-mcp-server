import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";
import { readWalletPrivateKey } from "../../utils/readWalletKeystore.js";

export const processProtectedData = {
    name: "process_protected_data",
    description: "Process a protected dataset using iExec confidential computing",
    inputSchema: {
        type: "object",
        properties: {
            protectedData: { type: "string" }, // required
            app: { type: "string" },           // required

            userWhitelist: { type: "string" },
            maxPrice: { type: "number" },
            path: { type: "string" },
            args: { type: "string" },
            inputFiles: {
                type: "array",
                items: { type: "string" },
            },
            secrets: {
                type: "object",
                additionalProperties: { type: "string" },
            },
            workerpool: { type: "string" },
            useVoucher: { type: "boolean" },
            voucherOwner: { type: "string" },
        },
        required: ["protectedData", "app"],
    },
    handler: async (params: any) => {
        const {
            protectedData,
            app,
            userWhitelist,
            maxPrice,
            path,
            args,
            inputFiles,
            secrets,
            workerpool,
            useVoucher,
            voucherOwner,
        } = params;

        if (
            typeof protectedData !== "string" ||
            typeof app !== "string"
        ) {
            throw new McpError(ErrorCode.InvalidParams, "Missing required parameters");
        }

        try {
            const privateKey = await readWalletPrivateKey();
            const web3Provider = getWeb3Provider(privateKey);
            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);

            const processParams: any = {
                protectedData,
                app,
            };

            if (userWhitelist) processParams.userWhitelist = userWhitelist;
            if (typeof maxPrice === "number") processParams.maxPrice = maxPrice;
            if (path) processParams.path = path;
            if (args) processParams.args = args;
            if (inputFiles) processParams.inputFiles = inputFiles;
            if (secrets) processParams.secrets = secrets;
            if (workerpool) processParams.workerpool = workerpool;
            if (typeof useVoucher === "boolean") processParams.useVoucher = useVoucher;
            if (voucherOwner) processParams.voucherOwner = voucherOwner;

            const result = await dataProtectorCore.processProtectedData(processParams);

            return {
                message: "Protected data processed successfully",
                txHash: result.txHash,
            };
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
