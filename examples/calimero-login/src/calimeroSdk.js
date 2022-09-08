import { CalimeroSdk } from "calimero-auth-sdk";

export default CalimeroSdk.init({
    shardId: "xabisahrd-calimero-testnet",
    walletUrl: "https://localhost:1234",
    calimeroUrl: "https://api.staging.calimero.network",
    calimeroWebSdkService: "https://api.staging.calimero.network",
});
