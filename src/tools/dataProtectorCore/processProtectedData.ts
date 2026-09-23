import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";
import { readWalletPrivateKey } from "../../utils/readWalletKeystore.js";
import { chain } from "../../utils/chain.js";

export const processProtectedData = {
    name: "process_protected_data",
    description: "Process a protected dataset using iExec confidential computing",
    inputSchema: {
        type: "object",
        properties: {
            protectedData: { type: "string" }, // required
            app: { type: "string" },           // required

            userWhitelist: { type: "string" },
            dataMaxPrice: { type: "number" },
            appMaxPrice: { type: "number" },
            workerpoolMaxPrice: { type: "number" },
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
        },
        required: ["protectedData", "app"],
    },
    handler: async (params: any) => {
        const {
            protectedData,
            app,
            userWhitelist,
            dataMaxPrice,
            appMaxPrice,
            workerpoolMaxPrice,
            path,
            args,
            inputFiles,
            secrets,
            workerpool,
        } = params;

        if (
            typeof protectedData !== "string" ||
            typeof app !== "string"
        ) {
            throw new McpError(ErrorCode.InvalidParams, "Missing required parameters");
        }

        try {
            const privateKey = await readWalletPrivateKey();
            const web3Provider = getWeb3Provider(privateKey, chain.name);
            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);

            const processParams: any = {
                protectedData,
                app,
            };

            if (userWhitelist) processParams.userWhitelist = userWhitelist;
            if (typeof dataMaxPrice === "number") processParams.dataMaxPrice = dataMaxPrice;
            if (typeof appMaxPrice === "number") processParams.appMaxPrice = appMaxPrice;
            if (typeof workerpoolMaxPrice === "number") processParams.workerpoolMaxPrice = workerpoolMaxPrice;
            if (path) processParams.path = path;
            if (args) processParams.args = args;
            if (inputFiles) processParams.inputFiles = inputFiles;
            if (secrets) processParams.secrets = secrets;
            if (workerpool) processParams.workerpool = workerpool;

            const result = await dataProtectorCore.processProtectedData(processParams);

            return {
                message: "Protected data processed successfully",
                txHash: result.txHash,
                dealId: result.dealId,
                taskId: result.taskId,
            };
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
