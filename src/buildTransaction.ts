import * as nearAPI from "near-api-js";
import axios from "axios";
import { PublicKey } from "near-api-js/lib/utils";

interface TransactionArgs {
    sender: string,
    receiver: string,
    url: string,
    publicKey: PublicKey,
    xApiKey: string,
    actions: nearAPI.transactions.Action[]
}

export const buildTransaction = async ({
  sender,
  receiver,
  url,
  publicKey,
  xApiKey,
  actions
}: TransactionArgs): Promise<nearAPI.transactions.Transaction> => {
  console.log(actions);
  const options = {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": xApiKey,
    },
  };

  const response = await axios.post(url,
    JSON.stringify({
      "jsonrpc": "2.0",
      "id": "dontcare",
      "method": "query",
      "params": {
        "request_type": "view_access_key",
        "finality": "final",
        "account_id": sender,
        "public_key": publicKey.toString(),
      }
    }),
    options
  );

  const accessKey = response.data.result;
  const nonce = ++accessKey.nonce;
  const recentBlockHash = nearAPI.utils.serialize.base_decode(
    accessKey.block_hash
  );

  return nearAPI.transactions.createTransaction(
    sender,
    publicKey,
    receiver,
    nonce,
    actions,
    recentBlockHash
  );
};