import { CalimeroSdk } from "calimero-auth-sdk";

export default CalimeroSdk.init({
    shardId: "90-calimero-testnet",
    walletUrl: "https://testnet.mynearwallet.com",
    calimeroUrl: "https://api.development.calimero.network",
    calimeroWebSdkService: "https://api.development.calimero.network",
});
