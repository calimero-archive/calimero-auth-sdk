import * as nearAPI from "near-api-js";
import { sha256 } from "js-sha256";

export const MAX_CALIMERO_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 30;

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