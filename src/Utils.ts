import * as nearAPI from "near-api-js";
import {Account, KeyPair} from "near-api-js";
import {getNearConfig, getRpcUrl} from "./NearConfig";

const { keyStores } = nearAPI;
const { connect } = nearAPI;
const {providers} = nearAPI;

export enum Environment {
    Development,
    Staging,
    Production,
}

export function environmentToContractNameInfix(env: Environment): string {
  if (env === Environment.Development) return ".dev";
  if (env === Environment.Staging) return ".stage";
  return "";
}

export enum Network {
    Testnet,
    Mainnet,
}

export function getNetworkId(network: Network) {
  if (network === Network.Testnet) return "testnet";
  if (network === Network.Mainnet) return "mainnet";
  return "";
}

export async function fetchAccount(network: Network, accountId: string, keyPair: KeyPair): Promise<Account> {
  const networkId = getNetworkId(network);
  const myKeyStore = new keyStores.InMemoryKeyStore();
  await myKeyStore.setKey(networkId,
    accountId,
    keyPair);

  const connectionConfig = {
    ...getNearConfig(network),
    keyStore: myKeyStore,
  };
  const nearConnection = await connect(connectionConfig);
  return await nearConnection.account(accountId);
}

export async function callViewMethod(network: Network,
  contractId: string,
  methodName: string,
  args: string): Promise<any> {

  const connectionInfo = { url: getRpcUrl(network) };
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
