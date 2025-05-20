import { Wallet } from 'ethers';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { getWeb3Provider, IExecWeb3mail, WorkflowError } from '@iexec/web3mail';

export const fetchUserContacts = {
    name: 'fetchUserContacts',
    description: 'Fetch user contacts for a given Ethereum address',
    inputSchema: {
        type: 'object',
        properties: {
            privateKey: { type: 'string' },
            userAddress: { type: 'string' },
        },
        required: ['privateKey', 'userAddress'],
    },
    handler: async (params: any) => {
        const { privateKey, userAddress } = params;

        if (typeof privateKey !== 'string' || typeof userAddress !== 'string') {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid or missing parameters');
        }

        try {
            const signer = new Wallet(privateKey);
            const web3Provider = getWeb3Provider(signer.privateKey);
            const web3mail = new IExecWeb3mail(web3Provider);

            return await web3mail.fetchUserContacts({ userAddress });
        } catch (error: any) {
            if (error instanceof WorkflowError) {
                if (error.isProtocolError) {
                    throw new McpError(ErrorCode.InternalError, error.message);
                } else {
                    throw new McpError(ErrorCode.InvalidParams, error.message);
                }
            }
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
