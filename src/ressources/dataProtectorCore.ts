import { getWeb3Provider, IExecDataProtectorCore } from "@iexec/dataprotector";

export function createDataProtectorCore(privateKey: string) {
    const provider = getWeb3Provider(privateKey);
    return new IExecDataProtectorCore(provider);
}
