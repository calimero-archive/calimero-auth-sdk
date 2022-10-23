import { CalimeroSdk } from "calimero-auth-sdk";

export default CalimeroSdk.init({
  shardId: process.env.REACT_APP_CALIMERO_SHARD_ID,
  walletUrl: process.env.REACT_APP_WALLET_ENDPOINT_URL,
  calimeroUrl: process.env.REACT_APP_CALIMERO_ENDPOINT_URL,
  calimeroWebSdkService: process.env.REACT_APP_CALIMERO_WEB_SDK_SERVICE_URL,
});
