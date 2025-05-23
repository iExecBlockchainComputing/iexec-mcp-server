import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Wallet } from "ethers";
import {
    getWeb3Provider,
    IExecDataProtectorCore,
} from "@iexec/dataprotector";
import { readWalletPrivateKey } from "../../utils/readWalletKeystore.js";

export const getProtectedData = {
    name: "get_protected_data",
    description:
        "Retrieve protected data using iExec DataProtector. You can filter by owner, data address, schema, timestamp, pagination.",
    inputSchema: {
        type: "object",
        properties: {
            owner: { type: "string" },
            protectedDataAddress: { type: "string" },
            requiredSchema: { type: "object" },
            createdAfterTimestamp: { type: "number" },
            page: { type: "number" },
            pageSize: { type: "number" },
        },
        required: [],
    },
    handler: async () => {
        try {
            const privateKey = await readWalletPrivateKey();
            const wallet = new Wallet(privateKey);
            const web3Provider = getWeb3Provider(privateKey);

            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);

            const protectedDataList = await dataProtectorCore.getProtectedData({
                owner: wallet.address,
            });

            return {
                count: protectedDataList.length,
                protectedData: protectedDataList.map((data: any) => ({
                    name: data.name,
                    address: data.address,
                    schema: data.schema,
                    owner: data.owner,
                    timestamp: data.timestamp,
                    url: `https://explorer.iex.ec/bellecour/dataset/${data.address}`,
                })),
            };
        } catch (error: any) {
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
