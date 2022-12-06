import {callViewMethod, Network} from "./Utils";

export class BalanceClient {

  static async ftBalanceOfOnNear(network: Network, contractId: string, accountId: string): Promise<number> {
    const args = `{ "account_id": "${accountId}" }`;
    const queryResponse = await callViewMethod(network, contractId, "ft_balance_of", args);

    return JSON.parse(Buffer.from(queryResponse.result).toString());
  }

  static async getNftOwnerId(network: Network, contractId: string, tokenId: string): Promise<string> {
    const args = `{ "token_id": "${tokenId}" }`;
    const queryResponse = await callViewMethod(network, contractId, "nft_token", args);

    return JSON.parse(Buffer.from(queryResponse.result).toString()).owner_id;
  }

  static async getNftTokensForOwner(network: Network, contractId: string, accountId: string): Promise<any[]> {
    const args = `{ "account_id": "${accountId}" }`;
    const queryResponse = await callViewMethod(network, contractId, "nft_tokens_for_owner", args);

    return JSON.parse(Buffer.from(queryResponse.result).toString());
  }
}
