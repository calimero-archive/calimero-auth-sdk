import * as nearAPI from "near-api-js";
import {KeyPair} from "near-api-js";
import { Contract } from "near-api-js";
import {Environment, Network, environmentToContractNameInfix, fetchAccount} from "./Utils";
import { PERMISSIONS_CONTRACT_PREFIX, CALIMERO_CONTRACT_SUFFIX } from "./Constants";

export class ConnectorPermissions {

  shardName: string;
  permissionsContract: Contract;

  private constructor(shardName: string, permissionsContract: nearAPI.Contract)
  {
    this.shardName = shardName;
    this.permissionsContract = permissionsContract;
  }
  
  static async init(shardName: string,
    env: Environment,
    network: Network,
    accountId: string,
    keyPair: KeyPair): Promise<ConnectorPermissions> {

    const account = await fetchAccount(network, accountId, keyPair);

    const envInfix = environmentToContractNameInfix(env);
    const permissionsContract = new Contract(
      account,
      PERMISSIONS_CONTRACT_PREFIX + shardName + envInfix + CALIMERO_CONTRACT_SUFFIX,
      {
        viewMethods: ["can_bridge"],
        changeMethods: ["deny_bridge", "allow_bridge"],
      }
    );

    return new ConnectorPermissions(shardName,
      permissionsContract);
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
