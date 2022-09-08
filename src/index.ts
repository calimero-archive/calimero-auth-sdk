import * as nearAPI from "near-api-js";
import { sha256 } from "js-sha256";

import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { buildTransaction } from "./buildTransaction";
import * as buffer from "buffer";
import { parseWalletDataFromStoredToken } from "./utils";
import { MAX_CALIMERO_TOKEN_DURATION, WalletData, CalimeroToken, CalimeroTokenData } from "./CalimeroToken";
import { Transaction } from "near-api-js/lib/transaction";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Buffer = buffer.Buffer;


const MESSAGE_KEY = "calimeroSecret";
const MESSAGE_HASH_KEY = "calimeroSecretHash";
const AUTH_TOKEN_KEY = "calimeroToken";
const CALIMERO_TOKEN_KEY = "caliToken";
//Max valid period for a token would be 30 days

const clearLocalStorage = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(MESSAGE_KEY);
  localStorage.removeItem(MESSAGE_HASH_KEY);
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

  sendAddKeyAction = async() => {
    const keyPair = nearAPI.KeyPair.fromRandom("ed25519");
    const faKey = keyPair.getPublicKey();
    const actions: nearAPI.transactions.Action[] = [
      nearAPI.transactions.addKey(
        faKey, 
        nearAPI.transactions.fullAccessKey())
    ];
    const tx: Transaction = await this.generateTransaction(
      this.getAccount() as string,
      actions);
    return this.requestSignAndSendTransactions([tx]);
  }
  
  isSignedIn(): boolean {
    return (localStorage.getItem(AUTH_TOKEN_KEY) !== null 
      && localStorage.getItem(CALIMERO_TOKEN_KEY) !== null);
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

  authenticate = async() => {
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
    try {
      const res = await axios.post(
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
      );
      if (res.status == 200) {
        console.log(res.data);
        localStorage.setItem(AUTH_TOKEN_KEY,
          res.data.secretToken);
        console.log(JSON.stringify(res.data.calimeroToken));
        localStorage.setItem(CALIMERO_TOKEN_KEY,
          JSON.stringify(res.data.calimeroToken));
        window.location.reload();
      }return false;
    }catch(err) {
      console.error(err);
    }
  }

  signIn = () => (!localStorage.getItem(MESSAGE_KEY)) ? this.signMessage() : this.authenticate();

  getAccount = () => {
    if(!this.isSignedIn) {
      throw new Error("SignIn required before sign a transaction");
    }
    const caliToken = localStorage.getItem(CALIMERO_TOKEN_KEY);
    if(!caliToken) return null;
    const { accountId } = parseWalletDataFromStoredToken(caliToken);
    return accountId;
  }

  syncAccount = async() => {
    if(!this.isSignedIn) {
      console.log("SignIn required before sign a transaction");
      return;
    }
    const url = 
    `${this._config.calimeroWebSdkService}/api/v1/shards/${this._config.shardId}/wallet/api/v1/account/sync`;
    try {
      const res = await axios.post(
        url,
        {
          calimeroToken: localStorage.getItem(CALIMERO_TOKEN_KEY),
          secretToken: localStorage.getItem(AUTH_TOKEN_KEY)
        }
      );
      if (res.status == 200) {
        return true;
      }
      return false;
    } catch(err) {
      console.error(err);
      return false;
    }
  }

  generateTransaction = async (
    receiver: string,
    actions: nearAPI.transactions.Action[]
  ): Promise<nearAPI.transactions.Transaction> => {
    if(!this.isSignedIn) {
      throw Error("SignIn required before sign a transaction");
    }
    const caliToken = localStorage.getItem(CALIMERO_TOKEN_KEY);
    const xApiKey = localStorage.getItem(AUTH_TOKEN_KEY);
    if(!caliToken || !xApiKey) {
      throw Error("Invalid credentials");
    }
    const { accountId, publicKey} = parseWalletDataFromStoredToken(caliToken);
    const url = `${this._config.calimeroUrl}/api/v1/shards/${this._config.shardId}/neard-rpc`;

    return buildTransaction(
      {
        sender: accountId,
        publicKey,
        receiver,
        url,
        xApiKey,
        actions
      }
    );
  }

  requestSignAndSendTransactions = async(transactions: nearAPI.transactions.Transaction[]) => {
    if(!this.isSignedIn) {
      console.log("SignIn required before sign a transaction");
      return;
    }

    const encoded = transactions
      .map(tx => nearAPI.utils.serialize.serialize(nearAPI.transactions.SCHEMA,
        tx))
      .map(serialized => Buffer.from(serialized).toString("base64"))
      .join(",");
    return this.requestSignRawTransaction(encoded);
  }

  requestSignRawTransaction = (transactionString: string) => {
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
    const callbackUrl = encodeURIComponent("http://localhost:3000");
    window.location.href = 
      // eslint-disable-next-line max-len 
      `${this._config.walletUrl}/sign#transactions=${transactionString}&callbackUrl=${callbackUrl}&meta=${meta}`;
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
