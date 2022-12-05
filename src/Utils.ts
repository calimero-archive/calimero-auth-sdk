import * as nearAPI from "near-api-js";
import {Account, KeyPair} from "near-api-js";
import {getConnectionConfig, getNetworkId} from "./NetworkConfig";

const { keyStores } = nearAPI;
const { connect } = nearAPI;
const {providers} = nearAPI;

export enum Chain {
  Near,
  Calimero,
}

export enum Environment {
    Development,
    Staging,
    Production,
}

export function environmentToContractNameInfix(chain: Chain, env: Environment): string {
  if (chain === Chain.Near) {
    if (env === Environment.Development) return ".dev";
    if (env === Environment.Staging) return ".stage";
  }
  return "";
}

export enum Network {
    Testnet,
    Mainnet,
}

export async function fetchAccount(
  chain: Chain,
  network: Network,
  env: Environment,
  accountId: string,
  keyPair: KeyPair,
  shardName = "",
  apiKey = ""
): Promise<Account> {

  const networkId = getNetworkId(chain, network, shardName);
  const myKeyStore = new keyStores.InMemoryKeyStore();
  await myKeyStore.setKey(networkId, accountId, keyPair);

  const connectionConfig = {
    ...getConnectionConfig(chain, network, env, shardName, apiKey),
    keyStore: myKeyStore,
  };
  const nearConnection = await connect(connectionConfig);
  return await nearConnection.account(accountId);
}

export async function callViewMethod(
  connectionInfo: any,
  contractId: string,
  methodName: string,
  args: string): Promise<any> {

  const provider = new providers.JsonRpcProvider(connectionInfo);
  const encodedArgs = Buffer.from(args).toString("base64");

  return await provider.query({
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: encodedArgs,
    finality: "final",
  });
}
