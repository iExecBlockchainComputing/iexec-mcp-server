import { chain, knownApps } from "../utils/chain.js";

export const getIExecApps = {
    name: "get_iexec_apps",
    description: "Retrieve the whitelist address to grant access to for a known iExec app (e.g., web3mail, web3telegram) on the configured network. If no query is provided, returns all known apps.",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string" },
        },
        required: [],
    },

    handler: async ({ query }: { query?: string }) => {
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

        const allApps = Object.entries(knownApps).map(([appName, appData]) => ({
            appName,
            ...appData,
        }));

        if (query) {
            const normalizedQuery = normalize(query);
            for (const app of allApps) {
                if (app.aliases.some((alias) => normalize(alias) === normalizedQuery)) {
                    return { chain: chain.name, ...app };
                }
            }
            return {
                message: `No known app matched '${query}'`,
                chain: chain.name,
                knownApps: allApps,
            };
        }

        return {
            chain: chain.name,
            knownApps: allApps,
        };
    },
};
