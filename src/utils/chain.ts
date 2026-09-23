// Supported iExec networks. Values mirror the chain configs shipped in
// iexec, @iexec/dataprotector, @iexec/web3mail and @iexec/web3telegram.
const CHAINS = {
    "arbitrum-mainnet": {
        name: "arbitrum-mainnet",
        chainId: 42161,
        web3mailWhitelist: "0xD5054a18565c4a9E5c1aa3cEB53258bd59d4c78C",
        web3telegramWhitelist: "0x53AFc09a647e7D5Fa9BDC784Eb3623385C45eF89",
    },
    "arbitrum-sepolia-testnet": {
        name: "arbitrum-sepolia-testnet",
        chainId: 421614,
        web3mailWhitelist: "0x8d46d40840f1Aa2264F96184Ffadf04e5D573B9B",
        web3telegramWhitelist: "0x7291ff96100DA6CF97933C225B86124ef95aEc9b",
    },
} as const;

export type ChainName = keyof typeof CHAINS;

export const DEFAULT_CHAIN: ChainName = "arbitrum-mainnet";

function resolveChain() {
    const requested = process.env.CHAIN ?? DEFAULT_CHAIN;
    const chain = Object.values(CHAINS).find(
        ({ name, chainId }) => requested === name || requested === `${chainId}`
    );
    if (!chain) {
        throw new Error(
            `Unsupported CHAIN "${requested}". Supported values: ${Object.keys(CHAINS).join(", ")}`
        );
    }
    return chain;
}

export const chain = resolveChain();

export const getExplorerDatasetUrl = (address: string) =>
    `https://explorer.iex.ec/${chain.name}/dataset/${address}`;

// Known iExec apps. On Arbitrum, access is granted to the app whitelist
// contract (not the app address, which is resolved at runtime by Compass).
export const knownApps = {
    web3mail: {
        whitelistAddress: chain.web3mailWhitelist,
        aliases: ["web3mail", "web3 mail", "web3-mail"],
    },
    web3telegram: {
        whitelistAddress: chain.web3telegramWhitelist,
        aliases: ["web3telegram", "web3 telegram", "web3-telegram", "telegram"],
    },
};
