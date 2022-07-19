export declare const MAX_CALIMERO_TOKEN_DURATION: number;

export class WalletData {
    accountId: string;
    message: string;
    blockId: string;
    publicKey: Uint8Array;
    signature: string;
    keyType: string;
}

export class CalimeroTokenData {
        accountId: string;
        shardId: string;
        from: Date;
        to: Date;
}

export class CalimeroToken {
    walletData: WalletData;
    tokenData: CalimeroTokenData;
}