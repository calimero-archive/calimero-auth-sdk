import {Chain, Environment, Network} from "./Utils";
import {BalanceClient} from "./BalanceClient";
import {KeyPair} from "near-api-js";
import {ConnectorPermissions} from "./ConnectorPermissions";
import {FtClient} from "./FtClient";
import {NftClient} from "./NftClient";
import {LightClient} from "./LightClient";

export class Bridge {

  shardName: string;
  env: Environment;
  network: Network;
  apiKey: string;

  constructor(shardName: string, env: Environment, network: Network, apiKey = "")
  {
    this.shardName = shardName;
    this.env = env;
    this.network = network;
    this.apiKey = apiKey;
  }

  async ftBalanceOf(
    chain: Chain,
    contractId: string,
    accountId: string,
    apiKey = ""
  ): Promise<number> {
    return await BalanceClient.ftBalanceOf(
      chain,
      this.network,
      this.env,
      contractId,
      accountId,
      this.shardName,
      apiKey
    );
  }

  async getNftOwnerId(
    chain: Chain,
    contractId: string,
    tokenId: string,
    apiKey = ""
  ): Promise<string> {
    return await BalanceClient.getNftOwnerId(
      chain,
      this.network,
      this.env,
      contractId,
      tokenId,
      this.shardName,
      apiKey
    )
  }

  async getNftTokensForOwner(
    chain: Chain,
    contractId: string,
    accountId: string,
    apiKey = ""
  ): Promise<any[]> {
    return await BalanceClient.getNftTokensForOwner(
      chain,
      this.network,
      this.env,
      contractId,
      accountId,
      this.shardName,
      apiKey
    )
  }

  async getCurrentBlockHeight(chain: Chain): Promise<bigint> {
    const lightClient = new LightClient(this.shardName, this.env, this.network);
    return await lightClient.getCurrentBlockHeight(chain, this.apiKey);
  }

  async canBridge(
    chain: Chain,
    signerAccountId: string,
    signerKeyPair: KeyPair,
    accountId: string,
    connectorType: string
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.init(
      chain,
      this.shardName,
      this.env,
      this.network,
      signerAccountId,
      signerKeyPair,
      this.apiKey
    );

    return await permissionsContract.canBridge(accountId, connectorType);
  }

  async denyBridge(
    chain: Chain,
    signerAccountId: string,
    signerKeyPair: KeyPair,
    accountId: string,
    connectorType: string
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.init(
      chain,
      this.shardName,
      this.env,
      this.network,
      signerAccountId,
      signerKeyPair,
      this.apiKey
    );

    return await permissionsContract.denyBridge(accountId, connectorType);
  }

  async allowBridge(
    chain: Chain,
    signerAccountId: string,
    signerKeyPair: KeyPair,
    accountId: string,
    connectorType: string
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.init(
      chain,
      this.shardName,
      this.env,
      this.network,
      signerAccountId,
      signerKeyPair,
      this.apiKey
    );

    return await permissionsContract.allowBridge(accountId, connectorType);
  }

  async ftTransferCall(
    chain: Chain,
    accountId: string,
    keyPair: KeyPair,
    contractId: string,
    amount: number
  ): Promise<number> {
    const ftClient = new FtClient(this.shardName, this.env, this.network, this.apiKey);
    return await ftClient.ftTransferCall(chain, accountId, keyPair, contractId, amount);
  }

  async ftWithdraw(chain: Chain, accountId: string, keyPair: KeyPair, contractId: string, amount: number) {
    const ftClient = new FtClient(this.shardName, this.env, this.network, this.apiKey);
    return await ftClient.withdraw(chain, accountId, keyPair, contractId, amount);
  }

  async nftTransferCall(
    chain: Chain,
    accountId: string,
    keyPair: KeyPair,
    contractId: string,
    tokenId: string
  ): Promise<boolean> {
    const nftClient = new NftClient(this.shardName, this.env, this.network, this.apiKey);
    return await nftClient.nftTransferCall(chain, accountId, keyPair, contractId, tokenId);
  }

  async nftWithdraw(chain: Chain, accountId: string, keyPair: KeyPair, contractId: string, tokenId: string) {
    const nftClient = new NftClient(this.shardName, this.env, this.network, this.apiKey);
    return await nftClient.withdraw(chain, accountId, keyPair, contractId, tokenId);
  }
}
