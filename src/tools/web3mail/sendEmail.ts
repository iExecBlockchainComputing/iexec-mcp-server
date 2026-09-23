import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { getWeb3Provider, IExecWeb3mail } from '@iexec/web3mail';
import { readWalletPrivateKey } from '../../utils/readWalletKeystore.js';
import { chain } from '../../utils/chain.js';

export const sendEmail = {
    name: 'sendEmail',
    description: 'Send an email via Web3mail with protected data',
    inputSchema: {
        type: 'object',
        properties: {
            emailSubject: { type: 'string' },
            emailContent: { type: 'string' },
            protectedData: { type: 'string' },
            dataMaxPrice: { type: 'number' },             // optional
            appMaxPrice: { type: 'number' },              // optional
            workerpoolMaxPrice: { type: 'number' },       // optional
            workerpoolAddress: { type: 'string' },        // optional, defaults to the iExec TDX workerpool
            senderName: { type: 'string' },               // optional
            contentType: { type: 'string' },              // optional, e.g. 'text/plain' or 'text/html'
            label: { type: 'string' },                     // optional
        },
        required: ['emailSubject', 'emailContent', 'protectedData'],
    },
    handler: async (params: any) => {
        const {
            emailSubject,
            emailContent,
            protectedData,
            dataMaxPrice,
            appMaxPrice,
            workerpoolMaxPrice,
            workerpoolAddress,
            senderName,
            contentType,
            label,
        } = params;

        if (
            typeof emailSubject !== 'string' ||
            typeof emailContent !== 'string' ||
            typeof protectedData !== 'string'
        ) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid or missing required parameters');
        }

        try {
            const privateKey = await readWalletPrivateKey();
            const web3Provider = getWeb3Provider(privateKey, chain.name);
            const web3mail = new IExecWeb3mail(web3Provider);

            const sendEmailParams: any = {
                emailSubject,
                emailContent,
                protectedData,
            };

            if (dataMaxPrice !== undefined) sendEmailParams.dataMaxPrice = dataMaxPrice;
            if (appMaxPrice !== undefined) sendEmailParams.appMaxPrice = appMaxPrice;
            if (workerpoolMaxPrice !== undefined) sendEmailParams.workerpoolMaxPrice = workerpoolMaxPrice;
            if (workerpoolAddress !== undefined) sendEmailParams.workerpoolAddress = workerpoolAddress;
            if (senderName !== undefined) sendEmailParams.senderName = senderName;
            if (contentType !== undefined) sendEmailParams.contentType = contentType;
            if (label !== undefined) sendEmailParams.label = label;
            const response = await web3mail.sendEmail(sendEmailParams);
            return response;
        } catch (error: any) {
            console.error("Error sending email:", error);
            throw new McpError(ErrorCode.InternalError, error.message);
        }
    },
};
