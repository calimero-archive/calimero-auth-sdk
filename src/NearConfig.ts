import {Network} from "./Utils";

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

export function getNearConfig(network: Network): any {
  if (network === Network.Testnet) return nearConfigTestnet;
  if (network === Network.Mainnet) return nearConfigMainnet;
  return null;
}

export function getRpcUrl(network: Network): string {
  return getNearConfig(network).nodeUrl;
}
