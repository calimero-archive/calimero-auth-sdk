import {Chain, ConnectorType, Environment, Network} from "./Utils";
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
    accountId: string
  ): Promise<number> {
    return await BalanceClient.ftBalanceOf(
      chain,
      this.network,
      this.env,
      contractId,
      accountId,
      this.shardName,
      this.apiKey
    );
  }

  async getNftOwnerId(
    chain: Chain,
    contractId: string,
    tokenId: string
  ): Promise<string> {
    return await BalanceClient.getNftOwnerId(
      chain,
      this.network,
      this.env,
      contractId,
      tokenId,
      this.shardName,
      this.apiKey
    )
  }

  async getNftTokensForOwner(
    chain: Chain,
    contractId: string,
    accountId: string
  ): Promise<any[]> {
    return await BalanceClient.getNftTokensForOwner(
      chain,
      this.network,
      this.env,
      contractId,
      accountId,
      this.shardName,
      this.apiKey
    )
  }

  async getCurrentBlockHeight(chain: Chain): Promise<bigint> {
    const lightClient = new LightClient(this.shardName, this.env, this.network);
    return await lightClient.getCurrentBlockHeight(chain, this.apiKey);
  }

  async canBridge(
    chain: Chain,
    accountId: string,
    connectorType: ConnectorType
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForViewMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      this.apiKey
    );

    return await permissionsContract.canBridge(accountId, connectorType);
  }

  async getAllowRegexRules(
    chain: Chain,
    connectorType: ConnectorType
  ): Promise<string[]> {
    const permissionsContract = await ConnectorPermissions.initForViewMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      this.apiKey
    );

    return await permissionsContract.getAllowRegexRules(connectorType);
  }

  async addAllowRegexRule(
    chain: Chain,
    signerAccountId: string,
    signerKeyPair: KeyPair,
    regexRule: string,
    connectorType: ConnectorType
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForChangeMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      signerAccountId,
      signerKeyPair,
      this.apiKey
    );

    return await permissionsContract.addAllowRegexRule(regexRule, connectorType);
  }

  async removeAllowedRegexRule(
    chain: Chain,
    signerAccountId: string,
    signerKeyPair: KeyPair,
    regexRule: string,
    connectorType: ConnectorType
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForChangeMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      signerAccountId,
      signerKeyPair,
      this.apiKey
    );

    return await permissionsContract.removeAllowedRegexRule(regexRule, connectorType);
  }

  async denyCrossShardCallPerContract(
    chain: Chain,
    signerAccountId: string,
    signerKeyPair: KeyPair,
    accountRegex: string,
    contractRegex: string
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForChangeMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      signerAccountId,
      signerKeyPair,
      this.apiKey
    );

    return await permissionsContract.denyCrossShardCallPerContract(accountRegex, contractRegex);
  }

  async removeDeniedCrossShardCallPerContract(
    chain: Chain,
    signerAccountId: string,
    signerKeyPair: KeyPair,
    accountRegex: string,
    contractRegex: string
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForChangeMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      signerAccountId,
      signerKeyPair,
      this.apiKey
    );

    return await permissionsContract.removeDeniedCrossShardCallPerContract(accountRegex, contractRegex);
  }

  async canMakeCrossShardCallForContract(
    chain: Chain,
    accountId: string,
    contractId: string
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForViewMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      this.apiKey
    );

    return await permissionsContract.canMakeCrossShardCallForContract(accountId, contractId);
  }

  async getRegexAccountPerContractForXsc(chain: Chain): Promise<[string, string][]> {
    const permissionsContract = await ConnectorPermissions.initForViewMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      this.apiKey
    );

    return await permissionsContract.getRegexAccountPerContractForXsc();
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
