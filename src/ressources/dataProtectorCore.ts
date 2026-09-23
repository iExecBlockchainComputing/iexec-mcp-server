import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";
import { chain } from "../utils/chain.js";

export function createDataProtectorCore(privateKey: string) {
    const provider = getWeb3Provider(privateKey, chain.name);
    return new IExecDataProtectorCore(provider);
}
