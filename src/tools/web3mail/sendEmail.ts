import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { getWeb3Provider, IExecWeb3mail } from '@iexec/web3mail';
import { readWalletPrivateKey } from '../../utils/readWalletKeystore.js';

export const sendEmail = {
    name: 'sendEmail',
    description: 'Send an email via Web3mail with protected data',
    inputSchema: {
        type: 'object',
        properties: {
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
        required: ['emailSubject', 'emailContent', 'protectedData'],
    },
    handler: async (params: any) => {
        const {
            emailSubject,
            emailContent,
            protectedData,
            workerpoolMaxPrice,
            workerpoolAddressOrEns = "0x0975bfce90f4748dab6d6729c96b33a2cd5491f5",
            senderName,
            contentType,
            label,
            useVoucher,
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
            const web3Provider = getWeb3Provider(privateKey);
            const web3mail = new IExecWeb3mail(web3Provider);

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
            console.error("Error sending email:", error);
            throw new McpError(ErrorCode.InternalError, error);
        }
    },
};
