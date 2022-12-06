import {LIGHT_CLIENT_CONTRACT_PREFIX, CALIMERO_CONTRACT_SUFFIX} from "./Constants";
import {Environment, environmentToContractNameInfix, Network, callViewMethod} from "./Utils";

export class LightClient {
  shardName: string;
  envInfix: string;
  network: Network;

  constructor(shardName: string, env: Environment, network: Network)
  {
    this.shardName = shardName;
    this.envInfix = environmentToContractNameInfix(env);
    this.network = network;
  }

  async getCurrentBlockHeight(): Promise<bigint> {
    const args = "{}";
    const queryResponse = await callViewMethod(this.network,
      LIGHT_CLIENT_CONTRACT_PREFIX + this.shardName + this.envInfix + CALIMERO_CONTRACT_SUFFIX,
      "current_height",
      args);

    return JSON.parse(Buffer.from(queryResponse.result).toString());
  }
}
