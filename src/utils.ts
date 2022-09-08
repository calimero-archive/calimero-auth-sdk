import { PublicKey } from "near-api-js/lib/utils";
import { CalimeroToken } from "./CalimeroToken";

export const parseWalletDataFromStoredToken = (storedCalimeroToken: string) => {
  const calimeroToken: CalimeroToken = JSON.parse(storedCalimeroToken);
  const {accountId, publicKey} = calimeroToken.walletData;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return {accountId, publicKey: new PublicKey({keyType:0, data: publicKey.data.data})};
};

