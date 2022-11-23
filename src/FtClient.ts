import * as nearAPI from "near-api-js";
import { KeyPair } from "near-api-js";
const { Contract } = nearAPI;
import { Environment, Network, environmentToContractNameInfix, fetchAccount } from "./Utils";
import { FT_CONNECTOR_CONTRACT_PREFIX, CALIMERO_CONTRACT_SUFFIX } from "./Constants";

export class FtClient {
  shardName: string;
  envInfix: string;
  network: Network;

  constructor(shardName: string, env: Environment, network: Network)
  {
    this.shardName = shardName;
    this.envInfix = environmentToContractNameInfix(env);
    this.network = network;
  }

  async ftTransferCall(accountId: string, keyPair: KeyPair, contractId: string, amount: number): Promise<number> {
    const account = await fetchAccount(this.network, accountId, keyPair);

    const contract = new Contract(
      account,
      contractId,
      {
        viewMethods: [],
        changeMethods: ["ft_transfer_call"],
      }
    );
    const MAX_GAS = 300000000000000;
    const YOCTO_NEAR_AMOUNT = 1;

    try {
      // @ts-ignore
      const result = await contract.ft_transfer_call(
        {
          receiver_id: FT_CONNECTOR_CONTRACT_PREFIX + this.shardName + this.envInfix + CALIMERO_CONTRACT_SUFFIX,
          amount: amount.toString(),
          msg: "",
        },
        MAX_GAS,
        YOCTO_NEAR_AMOUNT,
      );

      return result;
    } catch (error) {
      console.log(error);
    }

    return 0;
  }
}
