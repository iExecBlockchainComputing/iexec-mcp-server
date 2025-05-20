import { Wallet } from 'ethers';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { IExecWeb3mail, WorkflowError } from '@iexec/web3mail';

export const sendEmail = {
    name: 'sendEmail',
    description: 'Send an email via Web3mail with protected data',
    inputSchema: {
        type: 'object',
        properties: {
            privateKey: { type: 'string' },
            emailSubject: { type: 'string' },
            emailContent: { type: 'string' },
            protectedData: { type: 'string' },
            workerpoolMaxPrice: { type: 'number' },       // optional
            workerpoolAddressOrEns: { type: 'string' },  // optional
            senderName: { type: 'string' },               // optional
            contentType: { type: 'string' },              // optional, e.g. 'text/plain' or 'text/html'
            label: { type: 'string' },                     // optional
            useVoucher: { type: 'boolean' },               // optional
        },
        required: ['privateKey', 'emailSubject', 'emailContent', 'protectedData'],
    },
    handler: async (params: any) => {
        const {
            privateKey,
            emailSubject,
            emailContent,
            protectedData,
            workerpoolMaxPrice,
            workerpoolAddressOrEns,
            senderName,
            contentType,
            label,
            useVoucher,
        } = params;

        if (
            typeof privateKey !== 'string' ||
            typeof emailSubject !== 'string' ||
            typeof emailContent !== 'string' ||
            typeof protectedData !== 'string'
        ) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid or missing required parameters');
        }

        try {
            const wallet = new Wallet(privateKey);
            const web3mail = new IExecWeb3mail(wallet);

            const sendEmailParams: any = {
                emailSubject,
                emailContent,
                protectedData,
            };

            if (workerpoolMaxPrice !== undefined) sendEmailParams.workerpoolMaxPrice = workerpoolMaxPrice;
            if (workerpoolAddressOrEns !== undefined) sendEmailParams.workerpoolAddressOrEns = workerpoolAddressOrEns;
            if (senderName !== undefined) sendEmailParams.senderName = senderName;
            if (contentType !== undefined) sendEmailParams.contentType = contentType;
            if (label !== undefined) sendEmailParams.label = label;
            if (useVoucher !== undefined) sendEmailParams.useVoucher = useVoucher;

            const response = await web3mail.sendEmail(sendEmailParams);

            return response;
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
