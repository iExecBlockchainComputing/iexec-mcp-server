import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { Wallet } from "ethers";
import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";

export const revokeAllAccess = {
    name: "revoke_all_access",
    description:
        "Revoke all granted access permissions for a protected dataset, regardless of app or user.",
    inputSchema: {
        type: "object",
        properties: {
            protectedData: { type: "string" },
            privateKey: { type: "string" },
        },
        required: ["protectedData", "privateKey"],
    },
    handler: async (params: any) => {
        const { protectedData, privateKey } = params;

        if (typeof protectedData !== "string") {
            throw new McpError(
                ErrorCode.InvalidParams,
                "Parameter protectedData must be a string"
            );
        }

        try {
            const signer = new Wallet(privateKey);
            const web3Provider = getWeb3Provider(signer.privateKey);
            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);

            const { grantedAccess } = await dataProtectorCore.getGrantedAccess({
                protectedData,
            });

            if (!grantedAccess.length) {
                return {
                    message: "No granted access found to revoke",
                    revokedAccesses: [],
                };
            }

            const revokedAccesses: any[] = [];

            for (const access of grantedAccess) {
                try {
                    const { txHash } = await dataProtectorCore.revokeOneAccess(access);
                    revokedAccesses.push({
                        access,
                        txHash,
                    });
                } catch (revokeErr: any) {
                    // Log failure per access, but continue
                    revokedAccesses.push({
                        access,
                        error: revokeErr.message || "Failed to revoke access",
                    });
                }
            }

            return {
                message: "Revocation process completed",
                revokedAccesses,
            };
        } catch (err: any) {
            throw new McpError(ErrorCode.InternalError, err.message);
        }
    },
};
