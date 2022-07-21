"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalimeroAuth = exports.CalimeroToken = exports.CalimeroTokenData = exports.WalletData = exports.MAX_CALIMERO_TOKEN_DURATION = void 0;
const js_sha256_1 = require("js-sha256");
const axios = require("axios");
const uuid_1 = require("uuid");
//Max valid period for a token would be 30 days
exports.MAX_CALIMERO_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 30;
class WalletData {
    accountId;
    message;
    blockId;
    publicKey;
    signature;
    constructor(accId, message, blockId, pubKey, sig) {
        this.accountId = accId;
        this.message = message;
        this.blockId = blockId;
        this.publicKey = pubKey;
        this.signature = sig;
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
    isDurationValid() {
        if (this.to === null) {
            return true;
        }
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
            publicKey: Buffer.from(this.walletData.publicKey.data).toString("base64"),
            keyType: this.walletData.publicKey.keyType,
        };
        const encodedSignedData = JSON.stringify(data);
        return this.walletData.publicKey.verify(new Uint8Array(js_sha256_1.sha256.update(Buffer.from(encodedSignedData)).arrayBuffer()), this.walletData.signature);
    }
    verify() {
        return this.isDurationValid() && this.isSignatureValid();
    }
}
exports.CalimeroToken = CalimeroToken;
class CalimeroAuth {
    constructor() { }
    isSignedIn() {
        return localStorage.getItem("calimeroToken") !== null;
    }
    signIn(config) {
        if (!localStorage.getItem("calimeroSecret")) {
            localStorage.setItem("calimeroSecret", (0, uuid_1.v4)().toString());
            localStorage.setItem("calimeroSecretHash", js_sha256_1.sha256.update(localStorage.getItem("calimeroSecret")).toString());
            const callbackUrl = encodeURIComponent(window.location.href);
            window.location.href = `${config.walletUrl}?message=${localStorage.getItem("calimeroSecretHash")}&callbackUrl=${callbackUrl}`;
        }
        const search = window.location.search;
        const params = new URLSearchParams(search);
        if (params.get("message") !== localStorage.getItem("calimeroSecretHash")) {
            console.log("Wallet Message is not the same as the calimeroSecretHash");
            return;
        }
        axios.post(config.authServiceUrl + "/api/v1/authenticate", {
            shardId: config.shardId,
            accountId: params.get("accountId"),
            blockId: params.get("blockId"),
            publicKey: params.get("publicKey"),
            signature: params.get("signature"),
            calimeroSecret: localStorage.getItem("calimeroSecret"),
            calimeroSecretHash: localStorage.getItem("calimeroSecretHash")
        }).then((res) => {
            if (res.status == 200) {
                localStorage.setItem("calimeroToken", res.data.secretToken);
            }
        }).catch((err) => {
            console.error(err);
        });
        window.location.href = "/";
    }
    signOut() {
        localStorage.removeItem("calimeroToken");
        localStorage.removeItem("calimeroSecret");
        localStorage.removeItem("calimeroSecretHash");
    }
}
exports.CalimeroAuth = CalimeroAuth;
module.exports = {
    MAX_CALIMERO_TOKEN_DURATION: exports.MAX_CALIMERO_TOKEN_DURATION,
    WalletData,
    CalimeroToken,
    CalimeroTokenData,
    CalimeroAuth
};
