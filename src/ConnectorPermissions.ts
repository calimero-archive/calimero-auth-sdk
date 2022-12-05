import * as nearAPI from "near-api-js";
import {Contract, KeyPair} from "near-api-js";
import {Chain, Environment, environmentToContractNameInfix, fetchAccount, Network} from "./Utils";
import {CALIMERO_CONTRACT_SUFFIX, PERMISSIONS_CONTRACT_PREFIX} from "./Constants";

export class ConnectorPermissions {

  shardName: string;
  permissionsContract: Contract;

  private constructor(shardName: string, permissionsContract: nearAPI.Contract)
  {
    this.shardName = shardName;
    this.permissionsContract = permissionsContract;
  }
  
  static async init(
    chain: Chain,
    shardName: string,
    env: Environment,
    network: Network,
    accountId: string,
    keyPair: KeyPair,
    apiKey = ""
  ): Promise<ConnectorPermissions> {

    const account = await fetchAccount(chain, network, env, accountId, keyPair, shardName, apiKey);

    const envInfix = environmentToContractNameInfix(chain, env);
    const permissionsContract = new Contract(
      account,
      PERMISSIONS_CONTRACT_PREFIX + shardName + envInfix + CALIMERO_CONTRACT_SUFFIX,
      {
        viewMethods: ["can_bridge"],
        changeMethods: ["deny_bridge", "allow_bridge"],
      }
    );

    return new ConnectorPermissions(shardName, permissionsContract);
  }

  async canBridge(accountId: string, connectorType: string): Promise<boolean> {
    // @ts-ignore
    const result = await this.permissionsContract.can_bridge({
      account_id: accountId,
      connector_type: connectorType,
    });

    return result;
  }

  async denyBridge(accountId: string, connectorType: string): Promise<boolean> {
    // @ts-ignore
    const result = await this.permissionsContract.deny_bridge({
      account_id: accountId,
      connector_type: connectorType,
    });

    return result;
  }

  async allowBridge(accountId: string, connectorType: string): Promise<boolean> {
    // @ts-ignore
    const result = await this.permissionsContract.allow_bridge({
      account_id: accountId,
      connector_type: connectorType,
    });

    return result;
  }
}
