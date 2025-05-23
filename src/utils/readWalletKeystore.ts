import { promises as fs } from 'fs';
import os from 'os';

export async function readWalletPrivateKey() {
    const envPrivateKey = process.env.PRIVATE_KEY;
    const rawPath = process.env.PRIVATE_KEY_PATH;

    if (envPrivateKey) {
        return envPrivateKey;
    }

    if (!rawPath) {
        console.error('❌ Neither PRIVATE_KEY nor PRIVATE_KEY_PATH is set in your .env');
        return null;
    }

    const keyPath = rawPath.replace(/^~\//, `${os.homedir()}/`);

    try {
        const fileContent = await fs.readFile(keyPath, 'utf-8');
        const wallet = JSON.parse(fileContent);

        if (!wallet.privateKey) {
            throw new Error('Missing "privateKey" in wallet.json');
        }

        return wallet.privateKey;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`❌ Failed to load wallet from ${keyPath}: ${error.message}`);
        } else {
            console.error(`❌ Failed to load wallet from ${keyPath}:`, error);
        }
        return null;
    }
}
