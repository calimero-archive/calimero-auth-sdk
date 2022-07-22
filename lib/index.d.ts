import * as nearAPI from "near-api-js";
export declare const MAX_CALIMERO_TOKEN_DURATION: number;
export declare class WalletData {
    accountId: string;
    message: string;
    blockId: string;
    publicKey: nearAPI.utils.PublicKey;
    signature: Uint8Array;
    constructor(accId: string, message: string, blockId: string, pubKey: nearAPI.utils.PublicKey, sig: Uint8Array);
}
export declare class CalimeroTokenData {
    accountId: string;
    shardId: string;
    from: Date;
    to: Date;
    constructor(accountId: string, shardId: string, from?: Date, to?: Date);
    isDurationValid(): boolean;
}
export declare class CalimeroToken {
    walletData: WalletData;
    tokenData: CalimeroTokenData;
    constructor(walletData: WalletData, tokenData: CalimeroTokenData);
    isDurationValid(): boolean;
    isSignatureValid(): boolean;
    verify(): boolean;
}
export declare class CalimeroAuth {
    static isSignedIn(): boolean;
    static signIn(config: any): void;
    static signOut(): void;
}
