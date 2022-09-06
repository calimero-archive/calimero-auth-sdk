import * as nearAPI from "near-api-js";
import { sha256 } from "js-sha256";

import axios from "axios";
import { v4 as uuidv4 } from "uuid";


const MESSAGE_KEY = "calimeroSecret";
const MESSAGE_HASH_KEY = "calimeroSecretHash";
const AUTH_TOKEN_KEY = "calimeroToken";
const CALIMERO_TOKEN_KEY = "caliToken";
//Max valid period for a token would be 30 days
export const MAX_CALIMERO_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 30;

export class WalletData {
  accountId: string;
  message: string;
  blockId: string;
  publicKey: nearAPI.utils.PublicKey;
  signature: Uint8Array;

  constructor(
    accId: string,
    message: string,
    blockId: string,
    pubKey: nearAPI.utils.PublicKey,
    sig: Uint8Array)
  {
    this.accountId = accId;
    this.message = message;
    this.blockId = blockId;
    this.publicKey = pubKey;
    this.signature = sig;
  }
}

export class CalimeroTokenData {
  accountId: string;
  shardId: string;
  from: Date;
  to: Date;

  constructor(
    accountId: string,
    shardId: string,
    from: Date = new Date(Date.now()),
    to: Date = new Date(Date.now() + MAX_CALIMERO_TOKEN_DURATION))
  {
    this.accountId = accountId;
    this.shardId = shardId;
    this.from = from;
    this.to = to;
  }

  isDurationValid(): boolean {
    if (this.to === null) { return true }
    const isOrderRight = this.from < this.to;
    const isDurationWithinBounds = (this.to.getTime() - this.from.getTime()) <= MAX_CALIMERO_TOKEN_DURATION;
    const isExpired = this.to < new Date(Date.now());
    return isOrderRight && isDurationWithinBounds && (!isExpired);
  }
}

const clearLocalStorage = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(MESSAGE_KEY);
  localStorage.removeItem(MESSAGE_HASH_KEY);
}

export class CalimeroToken {
  walletData: WalletData;
  tokenData: CalimeroTokenData;

  constructor(walletData: WalletData, tokenData: CalimeroTokenData) {
    this.walletData = walletData;
    this.tokenData = tokenData;
  }

  isDurationValid(): boolean {
    return this.tokenData.isDurationValid();
  }

  isSignatureValid(): boolean {
    const data = {
      accountId: this.walletData.accountId,
      message: this.walletData.message,
      blockId: this.walletData.blockId,
      publicKey: Buffer.from(this.walletData.publicKey.data).toString("base64"),
      keyType: this.walletData.publicKey.keyType,
    };

    const encodedSignedData = JSON.stringify(data);

    return this.walletData.publicKey.verify(
      new Uint8Array(sha256.update(Buffer.from(encodedSignedData)).arrayBuffer()),
      this.walletData.signature,
    );
  }

  verify(): boolean {
    return this.isDurationValid() && this.isSignatureValid();
  }
}

interface CalimeroConfig {
  shardId: string,
  calimeroUrl: string,
  calimeroWebSdkService: string,
  walletUrl: string,
}

export class CalimeroSdk {
  private _config: CalimeroConfig;
  
  private constructor(config: CalimeroConfig) {
    this._config = config;
  }

  static init(config: CalimeroConfig) {
    return new CalimeroSdk(config);
  }

  isSignedIn(): boolean {
    return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
  }

  signMessage = () => {
    const message =  uuidv4().toString();
    localStorage.setItem(MESSAGE_KEY,
      message);
    localStorage.setItem(
      MESSAGE_HASH_KEY,
      sha256.update(message ).toString()
    );
    const callbackUrl = encodeURIComponent(window.location.href);
    window.location.href =
        // eslint-disable-next-line max-len
        `${this._config.walletUrl}/verify-owner?message=${localStorage.getItem(MESSAGE_HASH_KEY)}&callbackUrl=${callbackUrl}`;
  }

  authenticate = () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const accountId = params.get("accountId");
    const blockId = params.get("blockId");
    const publicKey = params.get("publicKey");
    const signature = params.get("signature");

    if(!accountId || !blockId || !publicKey || !signature) {
      clearLocalStorage();
      console.error("Missing params");
      return;
    }
    axios.post(
      this._config.calimeroUrl + "/api/v1/authenticate",
      {
        shardId: this._config.shardId,
        accountId,
        blockId,
        publicKey,
        signature,
        calimeroSecret: localStorage.getItem(MESSAGE_KEY),
        calimeroSecretHash: localStorage.getItem(MESSAGE_HASH_KEY)
      }
    ).then((res: any) => {
      if (res.status == 200) {
        console.log(res.data);
        localStorage.setItem(AUTH_TOKEN_KEY,
          res.data.secretToken);
        console.log(JSON.stringify(res.data.calimeroToken));
        localStorage.setItem(CALIMERO_TOKEN_KEY,
          JSON.stringify(res.data.calimeroToken));
        window.location.reload();
      }
    }).catch((err: any) => {
      console.error(err);
    });
  }

  signIn = () => (!localStorage.getItem(MESSAGE_KEY)) ? this.signMessage() : this.authenticate();

  syncAccount = () => {
    const url = 
    `${this._config.calimeroWebSdkService}/api/v1/shards/${this._config.shardId}/wallet/api/v1/account/sync`;

    axios.post(
      url,
      {
        calimeroToken: localStorage.getItem(CALIMERO_TOKEN_KEY),
        secretToken: localStorage.getItem(AUTH_TOKEN_KEY)
      }
    ).then((res: any) => {
      if (res.status == 200) {
        return true;
      }
    }).catch((err: any) => {
      console.error(err);
      return false;
    });
  }

  signTransaction = (transactionString: string, callbackUrl: string) => {
    if(!this.isSignedIn) {
      console.log("SignIn required before sign a transaction");
      return;
    }

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    //&callbackUrl=${encodeURIComponent(callbackUrl)}`;
    const metaJson = {
      calimeroRPCEndpoint: `${this._config.calimeroUrl}/api/v1/shards/${this._config.shardId}/neard-rpc`,
      calimeroShardId: this._config.shardId,
      calimeroAuthToken: token,
    };
    const meta = encodeURIComponent(JSON.stringify(metaJson));
    callbackUrl = encodeURIComponent(callbackUrl);
    window.location.href = 
      // eslint-disable-next-line max-len 
      `${this._config.walletUrl}/sign?transactions=${transactionString}&callbackUrl=${callbackUrl}#meta=${meta}`;
  }

  signOut = () => {
    clearLocalStorage();
    window.location.href = "/";
  }
}

module.exports = {
  MAX_CALIMERO_TOKEN_DURATION,
  WalletData,
  CalimeroToken,
  CalimeroTokenData,
  CalimeroSdk,
};
