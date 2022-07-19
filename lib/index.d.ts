export declare const MAX_CALIMERO_TOKEN_DURATION: number;
export declare class WalletData {
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
export declare class CalimeroTokenData {
    accountId: string;
    shardId: string;
    from: Date;
    to: Date;
    constructor(accountId: string, shardId: string, from?: Date, to?: Date);
    serialize(): string;
    toHash(): string;
    static deserialize(serialized: string): CalimeroTokenData;
    isDurationValid(): boolean;
}
export declare class CalimeroToken {
    walletData: WalletData;
    tokenData: CalimeroTokenData;
    constructor(walletData: WalletData, tokenData: CalimeroTokenData);
    isDurationValid(): boolean;
    isSignatureValid(): boolean;
    verify(): boolean;
    serialize(): string;
    static deserialize(serializedToken: string): CalimeroToken;
}
