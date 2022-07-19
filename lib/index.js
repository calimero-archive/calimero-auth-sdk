"use strict";
const nearAPI = require("near-api-js");
const sha256 = require("js-sha256");
//Max valid period for a token would be 30 days
const MAX_CALIMERO_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 30;
class WalletData {
    constructor(accId, message, blockId, pubKey, sig, keyType) {
        this.accountId = accId;
        this.message = message;
        this.blockId = blockId;
        this.publicKey = pubKey;
        this.signature = sig;
        this.keyType = keyType;
    }
    serialize() {
        const arr = Object.values(this);
        return arr.join("..");
    }
    static deserialize(serialized) {
        const objects = serialized.split("..");
        const wd = new WalletData(objects[0], objects[1], objects[2], objects[3], objects[4], objects[5]);
        return wd;
    }
}
class CalimeroTokenData {
    constructor(accountId, shardId, from = new Date(Date.now()), to = new Date(Date.now() + MAX_CALIMERO_TOKEN_DURATION)) {
        this.accountId = accountId;
        this.shardId = shardId;
        this.from = from;
        this.to = to;
    }
    serialize() {
        const ser = this.shardId + ".." + this.from.toISOString() + ".." + this.to.toISOString();
        return ser;
    }
    toHash() {
        return sha256.update(this.serialize()).toString();
    }
    static deserialize(serialized) {
        const objects = serialized.split("..");
        const ctd = new CalimeroTokenData(objects[0], objects[1], new Date(objects[1]), new Date(objects[2]));
        return ctd;
    }
    isDurationValid() {
        const isOrderRight = this.from < this.to;
        const isDurationWithinBounds = (this.to.getTime() - this.from.getTime()) <= MAX_CALIMERO_TOKEN_DURATION;
        const isExpired = this.to < new Date(Date.now());
        return isOrderRight && isDurationWithinBounds && (!isExpired);
    }
}
class CalimeroToken {
    constructor(walletData, tokenData) {
        this.walletData = walletData;
        this.tokenData = tokenData;
    }
    isDurationValid() {
        return this.tokenData.isDurationValid();
    }
    isSignatureValid() {
        const signedData = {
            accountId: this.walletData.accountId,
            message: this.walletData.message,
            blockId: this.walletData.blockId,
            publicKey: Buffer.from(this.walletData.publicKey).toString("base64"),
            keyType: Number(this.walletData.keyType)
        };
        const encodedSignedData = JSON.stringify(signedData);
        // wallet signs sha256(msg), so we need to sha256() it again
        const msg = new Uint8Array(sha256.update(Buffer.from(encodedSignedData)).arrayBuffer());
        const sig = new Uint8Array(Buffer.from(this.walletData.signature, "base64"));
        // const pk = nearAPI.utils.PublicKey(this.walletData.publicKey);
        const pk = new nearAPI.utils.PublicKey({ keyType: 0, data: this.walletData.publicKey });
        const trueMessage = this.tokenData.toHash() === this.walletData.message;
        return trueMessage && pk.verify(msg, sig);
    }
    verify() {
        return this.isDurationValid() && this.isSignatureValid();
    }
    serialize() {
        return this.walletData.serialize() + "..." + this.tokenData.serialize();
    }
    static deserialize(serializedToken) {
        const [walletDataString, tokenDataString] = serializedToken.split("...");
        try {
            const tokenData = CalimeroTokenData.deserialize(tokenDataString);
            const walletData = WalletData.deserialize(walletDataString);
            return new CalimeroToken(walletData, tokenData);
        }
        catch (e) {
            throw Error("Scrambled token data");
        }
    }
}
module.exports = {
    MAX_CALIMERO_TOKEN_DURATION,
    WalletData,
    CalimeroToken,
    CalimeroTokenData
};
