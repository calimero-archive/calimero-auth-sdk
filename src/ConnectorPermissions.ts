import {Contract, KeyPair} from "near-api-js";
import {
  callViewMethod,
  ChainType,
  ConnectorType,
  connectorTypeToString,
  Environment,
  environmentToContractNameInfix,
  fetchAccount,
  NetworkType
} from "./Utils";
import {CALIMERO_CONTRACT_SUFFIX, PERMISSIONS_CONTRACT_PREFIX} from "./Constants";
import {getConnectionInfo} from "./NetworkConfig";
import * as big from "bn.js";

export class ConnectorPermissions {

  contractId: string;
  permissionsContract: Contract | undefined;
  connectionInfo: any;

  private constructor(contractId: string)
  {
    this.contractId = contractId;
  }

  static async initForViewMethods(
    chain: ChainType,
    shardName: string,
    env: Environment,
    network: NetworkType,
    apiKey = ""
  ): Promise<ConnectorPermissions> {
    const envInfix = environmentToContractNameInfix(chain, env);
    const contractId = PERMISSIONS_CONTRACT_PREFIX + shardName + envInfix + CALIMERO_CONTRACT_SUFFIX;

    const connectorPermissions = new ConnectorPermissions(contractId);
    connectorPermissions.connectionInfo = getConnectionInfo(chain, network, env, shardName, apiKey);

    return connectorPermissions;
  }
  
  static async initForChangeMethods(
    chain: ChainType,
    shardName: string,
    env: Environment,
    network: NetworkType,
    accountId: string,
    keyPair: KeyPair,
    apiKey = ""
  ): Promise<ConnectorPermissions> {

    const account = await fetchAccount(chain, network, env, accountId, keyPair, shardName, apiKey);

    const envInfix = environmentToContractNameInfix(chain, env);
    const contractId = PERMISSIONS_CONTRACT_PREFIX + shardName + envInfix + CALIMERO_CONTRACT_SUFFIX;
    const permissionsContract = new Contract(
      account,
      contractId,
      {
        viewMethods: [],
        changeMethods: [
          "add_allow_regex_rule",
          "remove_allowed_regex_rule",
          "deny_cross_shard_call_per_contract",
          "remove_denied_cross_shard_call_per_contract"
        ],
      }
    );

    const connectorPermissions =  new ConnectorPermissions(contractId);
    connectorPermissions.permissionsContract = permissionsContract;
    return connectorPermissions;
  }

  async canBridge(accountId: string, connectorType: ConnectorType): Promise<boolean> {
    const args = `{ "account_id": "${accountId}", "connector_type": "${connectorTypeToString(connectorType)}" }`;
    const queryResponse = await callViewMethod(
      this.connectionInfo,
      this.contractId,
      "can_bridge",
      args
    );

    return JSON.parse(Buffer.from(queryResponse.result).toString());
  }

  async getAllowRegexRules(connectorType: ConnectorType): Promise<string[]> {
    const args = `{ "connector_type": "${connectorTypeToString(connectorType)}" }`;
    const queryResponse = await callViewMethod(
      this.connectionInfo,
      this.contractId,
      "get_allow_regex_rules",
      args
    );

    return JSON.parse(Buffer.from(queryResponse.result).toString());
  }

  async addAllowRegexRule(regexRule: string, connectorType: ConnectorType, attachedDeposit: string): Promise<boolean> {
    // @ts-ignore
    const result = await this.permissionsContract.add_allow_regex_rule({
      args: {
        regex_rule: regexRule,
        connector_type: connectorTypeToString(connectorType),
      },
      amount: new big.BN(attachedDeposit)
    });

    return result;
  }

  async removeAllowedRegexRule(regexRule: string, connectorType: ConnectorType): Promise<boolean> {
    // @ts-ignore
    const result = await this.permissionsContract.remove_allowed_regex_rule({
      regex_rule: regexRule,
      connector_type: connectorTypeToString(connectorType),
    });

    return result;
  }

  async denyCrossShardCallPerContract(
    accountRegex: string,
    contractRegex: string,
    attachedDeposit: string
  ): Promise<boolean> {
    // @ts-ignore
    const result = await this.permissionsContract.deny_cross_shard_call_per_contract({
      args: {
        account_regex: accountRegex,
        contract_regex: contractRegex,
      },
      amount: new big.BN(attachedDeposit)
    });

    return result;
  }

  async removeDeniedCrossShardCallPerContract(accountRegex: string, contractRegex: string): Promise<boolean> {
    // @ts-ignore
    const result = await this.permissionsContract.remove_denied_cross_shard_call_per_contract({
      account_regex: accountRegex,
      contract_regex: contractRegex,
    });

    return result;
  }

  async canMakeCrossShardCallForContract(accountId: string, contractId: string): Promise<boolean> {
    const args = `{ "account_id": "${accountId}", "contract_id": "${contractId}" }`;
    const queryResponse = await callViewMethod(
      this.connectionInfo,
      this.contractId,
      "can_make_cross_shard_call_for_contract",
      args
    );

    return JSON.parse(Buffer.from(queryResponse.result).toString());
  }

  async getAccountPerContractDeniesForXsc(): Promise<[string, string][]> {
    const args = "{}";
    const queryResponse = await callViewMethod(
      this.connectionInfo,
      this.contractId,
      "get_regex_account_per_contract_for_xsc",
      args
    );

    return JSON.parse(Buffer.from(queryResponse.result).toString());
  }
}
