import { CalimeroSdk } from "calimero-auth-sdk";

export default CalimeroSdk.init({
    shardId: "slim-shardy-calimero-testnet",
    walletUrl: "https://localhost:1234",
    calimeroUrl: "https://api.development.calimero.network",
    calimeroWebSdkService: "https://api.development.calimero.network",
});
