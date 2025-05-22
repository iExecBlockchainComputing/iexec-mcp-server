import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";

// Dictionnaire d'apps connues avec alias
const iExecApps = {
    web3mail: {
        // ens: "web3mail.apps.iexec.eth",
        // address: "0x0d8b899f2faa0fe9f0b17bcf4debd0cbc9e574ef",
        whitelistAddress: "0x781482C39CcE25546583EaC4957Fb7Bf04C277D2",
        aliases: ["web3mail", "web3 mail", "web3-mail"],
    },
    web3telegram: {
        // ens: "web3telegram.apps.iexec.eth",
        // address: "0xe997ea3284425d9ee537231d2562ff8373058b9c",
        whitelistAddress: "0x192C6f5AccE52c81Fcc2670f10611a3665AAA98F",
        aliases: ["web3telegram", "web3 telegram", "web3-telegram", "telegram"],
    },
};

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
    for (const app of Object.values(iExecApps)) {
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
        const privateKey = process.env.PRIVATE_KEY as string;

        if (!privateKey) {
            throw new McpError(ErrorCode.InternalError, "Missing PRIVATE_KEY in environment variables");
        }
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

            const resolvedApp = resolveApp(authorizedApp);
            console.error("Resolved app:", resolvedApp);
            const web3Provider = getWeb3Provider(privateKey);
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
