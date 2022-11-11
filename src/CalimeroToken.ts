import { sha256 } from "js-sha256";
import { PublicKey } from "near-api-js/lib/utils";

export const MAX_CALIMERO_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 30;

export class CalimeroToken {
  walletData: WalletData;
  tokenData: CalimeroTokenData;

  constructor(walletData: WalletData, tokenData: CalimeroTokenData) {
    this.walletData = walletData;
    this.tokenData = tokenData;
  }

  isDurationValid = () => this.tokenData.isDurationValid();

  isSignatureValid = () => this.walletData.isSignatureValid()

  verify = () => this.isDurationValid() && this.isSignatureValid();
}

export class WalletData {
  accountId: string;
  message: string;
  blockId: string;
  publicKey: string;
  signature: Uint8Array;

  constructor(
    accountId: string,
    message: string,
    blockId: string,
    publicKey: string,
    signature: string)
  {
    this.accountId = accountId;
    this.message = message;
    this.blockId = blockId;
    this.publicKey = publicKey;
    this.signature = new Uint8Array(Buffer.from(signature, "base64"));
  }

  isSignatureValid(): boolean {
    const data = {
      accountId: this.accountId,
      message: this.message,
      blockId: this.blockId,
      publicKey: this.publicKey,
    };

    const encodedSignedData = JSON.stringify(data);
    return PublicKey.fromString(this.publicKey).verify(
      new Uint8Array(sha256.array(encodedSignedData)),
      this.signature,
    );
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
