import React from "react";
import * as nearAPI from "near-api-js";

import calimeroSdk from "../../calimeroSdk";

const PrivateComponent= () => <div>
  <button onClick={calimeroSdk.syncAccount}>Sync Account</button>
  <button onClick={() => calimeroSdk.requestSignAndSendTransactions([nearAPI.transactions.transfer(nearAPI.utils.format.parseNearAmount("4"))])}>Send TX</button>
  <button onClick={calimeroSdk.signOut}>Logout</button>
</div>;

const PublicComponent = () => <div>
  <button onClick={calimeroSdk.signIn}>Login with NEAR</button>
</div>;

export default function Dashboard() {
  return calimeroSdk.isSignedIn() ? <PrivateComponent /> : <PublicComponent />;
};
