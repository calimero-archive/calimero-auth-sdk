export declare const MAX_CALIMERO_TOKEN_DURATION: number;

export class WalletData {
    accountId: string;
    message: string;
    blockId: string;
    publicKey: string;
    signature: string;
    keyType: string;

    constructor(accId: string, message: string, blockId: string, pubKey: string, sig: string, keyType: string);
    serialize(): string;
    static deserialize(serialized: string): WalletData;
}

export class CalimeroTokenData {
    accountId: string;
    shardId: string;
    from: Date;
    to: Date;

    constructor(accountId: string, shardId: string, from: Date, to: Date);
    serialize(): string;
    static deserialize(serialized: string): CalimeroTokenData;

    toHash(): string;
    isDurationValid(): boolean;
}

export class CalimeroToken {
    walletData: WalletData;
    tokenData: CalimeroTokenData;
  
    constructor(walletData: WalletData, tokenData: CalimeroTokenData);

    serialize(): string;
    static deserialize(serialized: string): CalimeroTokenData;

    toHash(): string;
    verify(): boolean;

    isSignatureValid(): boolean;
    isDurationValid(): boolean;
}