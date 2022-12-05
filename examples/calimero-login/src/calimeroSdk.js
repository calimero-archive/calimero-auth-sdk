import { CalimeroSdk } from "calimero-auth-sdk";

export default CalimeroSdk.init({
  shardId: "billing-17-calimero-testnet",
  walletUrl: "https://localhost:1234",
  calimeroUrl: "https://api.development.calimero.network",
  calimeroWebSdkService: "http://localhost:3000",
});

