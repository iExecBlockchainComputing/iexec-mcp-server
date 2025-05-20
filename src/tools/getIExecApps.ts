export const getIExecApps = {
    name: "get_iexec_apps",
    description: "Retrieve ENS, address and whitelistAddress for a known iExec app (e.g., web3mail, web3telegram). If no query is provided, returns all known apps.",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string" },
        },
        required: [],
    },

    handler: async ({ query }: { query?: string }) => {
        const knownApps = {
            web3mail: {
                ens: "web3mail.apps.iexec.eth",
                address: "0x0d8b899f2faa0fe9f0b17bcf4debd0cbc9e574ef",
                whitelistAddress: "0x1234567890abcdef1234567890abcdef12345678",
                aliases: ["web3mail", "web3 mail", "web3-mail"],
            },
            web3telegram: {
                ens: "web3telegram.apps.iexec.eth",
                address: "0xe997ea3284425d9ee537231d2562ff8373058b9c",
                whitelistAddress: "0x192C6f5AccE52c81Fcc2670f10611a3665AAA98F",
                aliases: ["web3telegram", "web3 telegram", "web3-telegram", "telegram"],
            },
        };

        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

        if (query) {
            const normalizedQuery = normalize(query);
            for (const [appName, appData] of Object.entries(knownApps)) {
                for (const alias of appData.aliases) {
                    if (normalize(alias) === normalizedQuery) {
                        return {
                            appName,
                            ...appData,
                        };
                    }
                }
            }
            return {
                message: `No known app matched '${query}'`,
                knownApps: Object.entries(knownApps).map(([appName, appData]) => ({
                    appName,
                    ...appData,
                })),
            };
        }

        return {
            knownApps: Object.entries(knownApps).map(([appName, appData]) => ({
                appName,
                ...appData,
            })),
        };
    },
};
