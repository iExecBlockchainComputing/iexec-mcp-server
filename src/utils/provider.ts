import { IExec, utils } from "iexec";
import { Wallet } from "ethers";
import { chain } from "./chain.js";

export interface IExecProviderResponse {
    iexec: IExec;
}

export const getIexecProvider = (): any => {
    try {
        const randomPrivateKey = Wallet.createRandom().privateKey;
        const ethProvider = utils.getSignerFromPrivateKey(chain.name, randomPrivateKey);
        const iexec = new IExec({ ethProvider });
        return { success: true, data: { iexec } };
    } catch (error) {
        console.error("[iExecProvider] Failed to instantiate iExec SDK:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error initializing iExec",
        };
    }
};
