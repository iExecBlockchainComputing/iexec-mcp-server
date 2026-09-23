import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";
import { readWalletPrivateKey } from "../../utils/readWalletKeystore.js";
import { chain, knownApps } from "../../utils/chain.js";

function isEthereumAddress(input: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(input);
}

function normalizeAppName(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveApp(appName: string) {
    if (isEthereumAddress(appName)) {
        return appName;
    }

    const normalized = normalizeAppName(appName);
    for (const app of Object.values(knownApps)) {
        for (const alias of app.aliases) {
            if (normalizeAppName(alias) === normalized) {
                return app.whitelistAddress;
            }
        }
    }

    return appName;
}

export const grantAccess = {
    name: "grant_access",
    description: "Grant access to a protected dataset to a specific app and user",
    inputSchema: {
        type: "object",
        properties: {
            protectedData: { type: "string" },
            authorizedApp: { type: "string" },
            authorizedUser: { type: "string" },
            pricePerAccess: { type: "number" }, // optionnel
            numberOfAccess: { type: "number" }, // optionnel
        },
        required: ["protectedData", "authorizedApp", "authorizedUser"],
    },

    handler: async (params: { protectedData: any; authorizedApp: any; authorizedUser: any; pricePerAccess: any; numberOfAccess: any; }) => {
        const {
            protectedData,
            authorizedApp,
            authorizedUser,
            pricePerAccess,
            numberOfAccess,
        } = params;

        if (
            typeof protectedData !== "string" ||
            typeof authorizedApp !== "string" ||
            typeof authorizedUser !== "string"
        ) {
            throw new McpError(
                ErrorCode.InvalidParams,
                "Parameters protectedData, authorizedApp and authorizedUser must be strings"
            );
        }

        try {
            const privateKey = await readWalletPrivateKey();
            const resolvedApp = resolveApp(authorizedApp);
            console.error("Resolved app:", resolvedApp);
            const web3Provider = getWeb3Provider(privateKey, chain.name);
            const dataProtectorCore = new IExecDataProtectorCore(web3Provider);

            const grantOptions: {
                protectedData: string;
                authorizedApp: string;
                authorizedUser: string;
                onStatusUpdate: ({ title, isDone }: { title: string; isDone: boolean }) => void;
                pricePerAccess?: number;
                numberOfAccess?: number;
            } = {
                protectedData,
                authorizedApp: resolvedApp,
                authorizedUser,
                onStatusUpdate: ({ title, isDone }: { title: string; isDone: boolean }) =>
                    console.error(`Status update: ${title}, done: ${isDone}`),
            };

            if (typeof pricePerAccess === "number") {
                grantOptions.pricePerAccess = pricePerAccess;
            }
            if (typeof numberOfAccess === "number") {
                grantOptions.numberOfAccess = numberOfAccess;
            }

            const grantedAccess = await dataProtectorCore.grantAccess(grantOptions);

            return {
                message: `Access granted to app "${resolvedApp}" for protected data`,
                grantedAccess,
            };
        } catch (error) {
            console.error("Error granting access:", error);
            if (error instanceof Error) {
                throw new McpError(ErrorCode.InternalError, error.message);
            } else {
                throw new McpError(ErrorCode.InternalError, String(error));
            }
        }
    },
};
