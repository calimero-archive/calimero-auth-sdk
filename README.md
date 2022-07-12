# calimero-auth-sdk
## Description
This SDK is used to generate Calimero Authentication Tokens.
These tokens are used to grant the user access to selected Calimero private shard RPC endpoints.

## How it works
Token data is generated based on user account ID and selected Calimero private shard ID,
Token data also includes a start and expiry date (maximum duration of a single token is 30 days).
This data is sent to My NEAR Wallet to be signed as a message (does not require a blockchain transaction, i.e. it's gas free).

Once the authorization service verifies that user account ID signed the message (containing token data), a Calimero Authorization Token is issued, allowing the user access to the selected Calimero private shard RPC endpoint.

## Usage
Create `CalimeroTokenData` with the required data: `accountId` and `shardId`. Duration of the token:`from` and `to` fields are optional and default to `Date.now()` and `Date.now() + MAX_CALIMERO_TOKEN_DURATION`, respectively.
Serialize the data using `calimeroTokenDataInstance.serialize()` and use this as the `message` parameter to be signed by My NEAR Wallet.
Store data received from My NEAR Wallet in a `WalletData` instance.

Create a `CalimeroToken` with `WalletData` and `CalimeroTokenData` instances: `calimeroToken = new CalimeroToken(walletData, calimeroTokenData`.

Verify the signed message by calling `calimeroToken.verify()`. This will check both is the token is valid with respect to `Date.now()` and if the signature matches the public key of the user account ID.

Access to the Calimero private shard RPC endpoint should be given to tokens which return `true` from `calimeroToken.verify()`.
