import * as NearAPI from "near-api-js";
import { sha256 } from "js-sha256";

//Max valid period for a token would be 30 days
export const MAX_CALIMERO_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 30;

export class WalletData {
  accountId: string;
  publicKey: string;
  signature: string;

  constructor(accId: string, pubKey: string, sig: string) {
    this.accountId = accId;
    this.publicKey = pubKey;
    this.signature = sig;
  }

  serialize(): string {
    return this.accountId + ".." + this.publicKey + ".." + this.signature;
  }

  static deserialize(serialized: string): WalletData {
    const objects = serialized.split("..");
    const wd = new WalletData(
      objects[0],
      objects[1],
      objects[2]);
    return wd;
  }
}

export class CalimeroTokenData {
  accountId: string;
  shardId: string;
  from: Date;
  to: Date;

  constructor(accountId: string,
    shardId: string,
    from: Date = new Date(Date.now()),
    to: Date = new Date(Date.now() + MAX_CALIMERO_TOKEN_DURATION)) {
    this.accountId = accountId;
    this.shardId = shardId;
    this.from = from;
    this.to = to;
  }

  serialize(): string {
    const ser = this.accountId + ".." + this.shardId + ".." + this.from.toISOString() + ".." + this.to.toISOString();
    return ser;
  }

  static deserialize(serialized: string): CalimeroTokenData {
    const objects = serialized.split("..");
    const ctd = new CalimeroTokenData(
      objects[0],
      objects[1],
      new Date(objects[2]),
      new Date(objects[3]));
    return ctd;
  }

  isDurationValid(): boolean {
    const isOrderRight = this.from < this.to;
    const isDurationWithinBounds = (this.to.getTime() - this.from.getTime()) <= MAX_CALIMERO_TOKEN_DURATION;
    const isExpired = this.to < new Date(Date.now());
    return isOrderRight && isDurationWithinBounds && (!isExpired);
  }
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
    // wallet signs sha256(msg), so we need to sha256() it again
    const msg = new Uint8Array(sha256.update(this.tokenData.serialize()).arrayBuffer());
    const sig = new Uint8Array(Buffer.from(
      this.walletData.signature,
      "base64"));
    const pk = NearAPI.utils.PublicKey.fromString(this.walletData.publicKey);
    return pk.verify(
      msg,
      sig
    );
  }

  verify(): boolean {
    return this.isDurationValid() && this.isSignatureValid();
  }

  serialize(): string {
    return this.walletData.serialize() + "..." +  this.tokenData.serialize();
  }

  static deserialize(serializedToken: string): CalimeroToken {
    const [walletDataString, tokenDataString] = serializedToken.split("...");

    try {

      const tokenData = CalimeroTokenData.deserialize(tokenDataString);
      const walletData = WalletData.deserialize(walletDataString);

      return new CalimeroToken(
        walletData,
        tokenData);
    }
    catch (e) {
      throw Error("Scrambled token data");
    }
  }
}
