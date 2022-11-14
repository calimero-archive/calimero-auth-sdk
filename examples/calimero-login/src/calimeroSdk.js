import { CalimeroSdk } from "calimero-auth-sdk";

export default CalimeroSdk.init({
  shardId: "brt2-calimero-testnet",
  walletUrl: "https://localhost:1234",
  calimeroUrl: "https://api.development.calimero.network",
  calimeroWebSdkService: "http://localhost:3000",
});

