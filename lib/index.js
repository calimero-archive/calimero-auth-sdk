"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalimeroToken = exports.CalimeroTokenData = exports.WalletData = exports.MAX_CALIMERO_TOKEN_DURATION = void 0;
const nearAPI = __importStar(require("near-api-js"));
const js_sha256_1 = require("js-sha256");
//Max valid period for a token would be 30 days
exports.MAX_CALIMERO_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 30;
class WalletData {
    accountId;
    message;
    blockId;
    publicKey;
    signature;
    keyType;
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
exports.WalletData = WalletData;
class CalimeroTokenData {
    accountId;
    shardId;
    from;
    to;
    constructor(accountId, shardId, from = new Date(Date.now()), to = new Date(Date.now() + exports.MAX_CALIMERO_TOKEN_DURATION)) {
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
        return js_sha256_1.sha256.update(this.serialize()).toString();
    }
    static deserialize(serialized) {
        const objects = serialized.split("..");
        const ctd = new CalimeroTokenData(objects[0], objects[1], new Date(objects[1]), new Date(objects[2]));
        return ctd;
    }
    isDurationValid() {
        const isOrderRight = this.from < this.to;
        const isDurationWithinBounds = (this.to.getTime() - this.from.getTime()) <= exports.MAX_CALIMERO_TOKEN_DURATION;
        const isExpired = this.to < new Date(Date.now());
        return isOrderRight && isDurationWithinBounds && (!isExpired);
    }
}
exports.CalimeroTokenData = CalimeroTokenData;
class CalimeroToken {
    walletData;
    tokenData;
    constructor(walletData, tokenData) {
        this.walletData = walletData;
        this.tokenData = tokenData;
    }
    isDurationValid() {
        return this.tokenData.isDurationValid();
    }
    isSignatureValid() {
        const data = {
            accountId: this.walletData.accountId,
            message: this.walletData.message,
            blockId: this.walletData.blockId,
            publicKey: this.walletData.publicKey,
            keyType: this.walletData.keyType,
        };
        const encoded = JSON.stringify(data);
        const msg = new Uint8Array(js_sha256_1.sha256.update(Buffer.from(encoded)).arrayBuffer());
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
exports.CalimeroToken = CalimeroToken;
module.exports = {
    MAX_CALIMERO_TOKEN_DURATION: exports.MAX_CALIMERO_TOKEN_DURATION,
    WalletData,
    CalimeroToken,
    CalimeroTokenData
};
