import { CalimeroToken, CalimeroTokenData, MAX_CALIMERO_TOKEN_DURATION, WalletData } from "../lib";

const accountId = "caliauth.testnet";
const shardId = "shard";
const signature = "1EwPgI0ejQ7JClkP7vjCvJDVJEJwr64TQ8+9Z4pyAAAyVqlrKHjM1C8kUz9VEzMXcYSstSG8+/V0znIggpESCA==";
const publicKey = "ed25519:FCbW55Vfk5vXVMY7wzARdP19G6xyhzHHq9xHn134wpwG";

const catData = new CalimeroTokenData(
  accountId,
  shardId,
  new Date(0),
  new Date(3600000)
);
const walletData = new WalletData(
  accountId,
  "",
  "",
  publicKey,
  signature,
  ""
);
const cat = new CalimeroToken(
  walletData,
  catData);
/* eslint-disable  max-len, @typescript-eslint/no-unused-vars */
const serializedToken="caliauth.testnet..ed25519:FCbW55Vfk5vXVMY7wzARdP19G6xyhzHHq9xHn134wpwG..1EwPgI0ejQ7JClkP7vjCvJDVJEJwr64TQ8+9Z4pyAAAyVqlrKHjM1C8kUz9VEzMXcYSstSG8+/V0znIggpESCA==...caliauth.testnet..shard..1970-01-01T00:00:00.000Z..1970-01-01T01:00:00.000Z";
/* eslint-enable  max-len, @typescript-eslint/no-unused-vars */

test(
  "Wallet signed CAT signature verification",
  () => {
    expect(cat.isSignatureValid()).toBeTruthy();
  }
);

test(
  "CAT serde",
  () => {
    const deserializedCat = CalimeroToken.deserialize(cat.serialize());

    expect(deserializedCat).toStrictEqual(cat);
  }
);

test(
  "CAT serialization",
  () => {
    expect(cat.serialize()).toStrictEqual(serializedToken);
  }
);

test(
  "CAT deserialization",
  () => {
    expect(CalimeroToken.deserialize(serializedToken)).toStrictEqual(cat);
  }
);

test(
  "CAT expired",
  () => {
    expect(cat.isDurationValid()).toBeFalsy();
  }
);

test(
  "CAT time valid",
  () => {
    const catDataTimeValid = new CalimeroTokenData(
      "",
      "",
      new Date(Date.now() - 1000),
      new Date(Date.now() + 1000)
    );

    expect(catDataTimeValid.isDurationValid()).toBeTruthy();
  }
);

test(
  "CAT from greater than to",
  () => {
    const catDataTimeInvalid = new CalimeroTokenData(
      "",
      "",
      new Date(Date.now() + 2000),
      new Date(Date.now())
    );
    expect(catDataTimeInvalid.isDurationValid()).toBeFalsy();
  }
)

test(
  "CAT duration out of bounds",
  () => {
    const catDataDurationTooLong = new CalimeroTokenData(
      "",
      "",
      new Date(Date.now()),
      new Date(Date.now() + MAX_CALIMERO_TOKEN_DURATION + 1000)
    );

    expect(catDataDurationTooLong.isDurationValid()).toBeFalsy();
  }
)
