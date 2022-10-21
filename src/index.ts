import { sha256 } from "js-sha256";

import { v4 as uuidv4 } from "uuid";

const AUTH_TOKEN_KEY = "calimeroToken";
const MESSAGE_KEY = "calimeroSessage";
const MESSAGE_HASH_KEY = "calimeroSecretHash";

const ACCOUNT_ID = "accountId";
const PUBLIC_KEY = "publicKey";

const clearLocalStorage = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(MESSAGE_KEY);
  localStorage.removeItem(MESSAGE_HASH_KEY);
  localStorage.removeItem(ACCOUNT_ID);
  localStorage.removeItem(PUBLIC_KEY);
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
    localStorage.setItem(
      MESSAGE_HASH_KEY,
      sha256.update(message ).toString()
    );
    //to do -> change http://localhost:3000 to calimeroUrl from calimeroSdK config file
    // eslint-disable-next-line max-len
    const callbackUrl = encodeURIComponent(`http://localhost:3000/accounts/sync/?shard=${this._config.shardId}&next=${window.location.href}&ogm=${message}`);
    window.location.href =
        // eslint-disable-next-line max-len
        `${this._config.walletUrl}/verify-owner?message=${localStorage.getItem(MESSAGE_HASH_KEY)}&callbackUrl=${callbackUrl}`;
  }

  signIn = () => (!localStorage.getItem(MESSAGE_KEY)) && this.signMessage();

  signTransaction = (transactionString: string, callbackUrl: string) => {
    if(!this.isSignedIn) {
      return {error: "SignIn required before sign a transaction"};
    }

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
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

  setCredentials = () =>  {
    if(window.location.hash) {
      try{
        const decodedData = JSON.parse(decodeURIComponent(window.location.hash.substring(1)));
        const walletData = JSON.parse(decodedData.calimeroToken).walletData;
        const message = walletData.message;
        const accountId = walletData.accountId;
        const publicKey = walletData.publicKey.data.data;
        const authToken = decodedData.secretToken;
        const sentHash = localStorage.getItem(MESSAGE_HASH_KEY);
        if(message !== sentHash){
          throw new Error("Sent Message hash is not equal to receiver, please try again!");
        }

        localStorage.setItem(AUTH_TOKEN_KEY,
          authToken);
        localStorage.setItem(MESSAGE_KEY,
          message);
        localStorage.setItem(ACCOUNT_ID,
          accountId);
        localStorage.setItem(PUBLIC_KEY,
          JSON.stringify(publicKey));
        this.confirmSignIn();
        return {success: "Sign in confirmed!"};

      }catch(error){
        if (typeof error === "string") {
          return {error: error.toUpperCase()}
        } else if (error instanceof Error) {
          return {error: error.message}
        }
      } 
    }
  }

  confirmSignIn = () => {
    if(window.location.hash){
      window.location.replace(window.location.origin)
    }
  }

}

module.exports = {
  CalimeroSdk,
};
