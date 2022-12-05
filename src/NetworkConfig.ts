import {Chain, Environment, Network} from "./Utils";
import {
  CALIMERO_NETWORK_SUFFIX, CALIMERO_RPC_NODE_SUFFIX,
  CALIMERO_RPC_NODE_URL_DEV,
  CALIMERO_RPC_NODE_URL_PROD,
  CALIMERO_RPC_NODE_URL_STAGE,
  MAINNET_NETWORK_ID,
  MAINNET_NETWORK_SUFFIX,
  TESTNET_NETWORK_ID,
  TESTNET_NETWORK_SUFFIX
} from "./Constants";

export const nearConfigTestnet = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
  headers: {},
};

export const nearConfigMainnet = {
  networkId: "mainnet",
  nodeUrl: "https://rpc.mainnet.near.org",
  walletUrl: "https://wallet.mainnet.near.org",
  helperUrl: "https://helper.mainnet.near.org",
  explorerUrl: "https://explorer.mainnet.near.org",
  headers: {},
};

export function getConnectionConfig(
  chain: Chain,
  network: Network,
  env: Environment,
  shardName = "",
  apiKey = ""
): any {

  if (chain === Chain.Near) {
    return getNearConfig(network);
  }
  if (chain === Chain.Calimero) {
    return getCalimeroConfig(network, env, shardName, apiKey);
  }
  return null;
}

export function getNearConfig(network: Network): any {
  if (network === Network.Testnet) return nearConfigTestnet;
  if (network === Network.Mainnet) return nearConfigMainnet;
  return null;
}

export function getCalimeroConfig(network: Network, env: Environment, shardName: string, apiKey: string): any {
  const networkId = getNetworkId(Chain.Calimero, network, shardName);
  return {
    networkId: networkId,
    nodeUrl: getCalimeroRpcUrl(network, env, shardName),
    headers: {
      "x-api-key": apiKey,
    }
  };
}

export function getNearRpcUrl(network: Network): string {
  return getNearConfig(network).nodeUrl;
}

export function getCalimeroRpcUrl(network: Network, env: Environment, shardName: string): string {
  const networkId = getNetworkId(Chain.Calimero, network, shardName);
  if (env === Environment.Development) {
    return CALIMERO_RPC_NODE_URL_DEV + networkId + CALIMERO_RPC_NODE_SUFFIX;
  }
  if (env === Environment.Staging) {
    return CALIMERO_RPC_NODE_URL_STAGE + networkId + CALIMERO_RPC_NODE_SUFFIX;
  }
  if (env === Environment.Production) {
    return CALIMERO_RPC_NODE_URL_PROD + networkId + CALIMERO_RPC_NODE_SUFFIX;
  }
  return "";
}

export function getConnectionInfo(
  chain: Chain,
  network: Network,
  env: Environment,
  shardName: string,
  apiKey: string
): any {

  if (chain === Chain.Near) {
    return { url: getNearRpcUrl(network) };
  }
  if (chain === Chain.Calimero) {
    return {
      url: getCalimeroRpcUrl(network, env, shardName),
      headers: {
        "x-api-key": apiKey,
      },
    }
  }
  return null;
}

export function getNetworkId(chain: Chain, network: Network, shardName = ""): string {
  if (chain === Chain.Near) {
    if (network === Network.Testnet) return TESTNET_NETWORK_ID;
    if (network === Network.Mainnet) return MAINNET_NETWORK_ID;
  }
  if (chain === Chain.Calimero) {
    if (network === Network.Testnet) return shardName + CALIMERO_NETWORK_SUFFIX + TESTNET_NETWORK_SUFFIX;
    if (network === Network.Mainnet) return shardName + CALIMERO_NETWORK_SUFFIX + MAINNET_NETWORK_SUFFIX;
  }
  return "";
}
