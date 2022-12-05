import * as nearAPI from "near-api-js";
import {KeyPair} from "near-api-js";
import {Chain, Environment, environmentToContractNameInfix, fetchAccount, Network} from "./Utils";
import {CALIMERO_CONTRACT_SUFFIX, FT_CONNECTOR_CONTRACT_PREFIX} from "./Constants";

const { Contract } = nearAPI;

export class FtClient {
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

  async ftTransferCall(
    chain: Chain,
    accountId: string,
    keyPair: KeyPair,
    contractId: string,
    amount: number
  ): Promise<number> {
    const account = await fetchAccount(chain, this.network, this.env, accountId, keyPair, this.shardName, this.apiKey);

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

    const envInfix = environmentToContractNameInfix(chain, this.env);
    try {
      // @ts-ignore
      const result = await contract.ft_transfer_call(
        {
          receiver_id: FT_CONNECTOR_CONTRACT_PREFIX + this.shardName + envInfix + CALIMERO_CONTRACT_SUFFIX,
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

  async withdraw(chain: Chain, accountId: string, keyPair: KeyPair, contractId: string, amount: number) {
    const account = await fetchAccount(chain, this.network, this.env, accountId, keyPair, this.shardName, this.apiKey);

    const contract = new Contract(
      account,
      contractId,
      {
        viewMethods: [],
        changeMethods: ["withdraw"],
      }
    );
    const MAX_GAS = 300000000000000;
    const YOCTO_NEAR_AMOUNT = 1;

    try {
      // @ts-ignore
      await contract.withdraw(
        {
          amount: amount.toString(),
        },
        MAX_GAS,
        YOCTO_NEAR_AMOUNT,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
