import {Contract, KeyPair} from "near-api-js";
import {CALIMERO_CONTRACT_SUFFIX, NFT_CONNECTOR_CONTRACT_PREFIX} from "./Constants";
import {Environment, Network, environmentToContractNameInfix, fetchAccount} from "./Utils";

export class NftClient {

  shardName: string;
  envInfix: string;
  network: Network;

  constructor(shardName: string, env: Environment, network: Network)
  {
    this.shardName = shardName;
    this.envInfix = environmentToContractNameInfix(env);
    this.network = network;
  }

  async nftTransferCall(accountId: string,
    keyPair: KeyPair,
    contractId: string,
    tokenId: string): Promise<boolean> {

    const account = await fetchAccount(this.network, accountId, keyPair);

    const contract = new Contract(
      account,
      contractId,
      {
        viewMethods: [],
        changeMethods: ["nft_transfer_call"],
      }
    );

    const MAX_GAS = 300000000000000;
    const YOCTO_NEAR_AMOUNT = 1;
    try {
      // @ts-ignore
      const result = await contract.nft_transfer_call(
        {
          receiver_id: NFT_CONNECTOR_CONTRACT_PREFIX + this.shardName + this.envInfix + CALIMERO_CONTRACT_SUFFIX,
          token_id: tokenId,
          msg: this.shardName + CALIMERO_CONTRACT_SUFFIX,
        },
        MAX_GAS,
        YOCTO_NEAR_AMOUNT,
      );

      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
