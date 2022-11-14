import { CalimeroSdk } from "calimero-auth-sdk";

export default CalimeroSdk.init({
  shardId: "xabi-calimero-testnet",
  walletUrl: "https://localhost:1234",
  calimeroUrl: "http://localhost:3000",
  calimeroWebSdkService: "http://localhost:3000",
});
