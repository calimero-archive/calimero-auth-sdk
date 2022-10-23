import React, { useEffect } from "react";

import calimeroSdk from "../../calimeroSdk";

const PrivateComponent= () => <div>
  <button onClick={() => calimeroSdk.signTransaction("EAAAAGRhbGVwYXBpLnRlc3RuZXQAccIgton1dWYvHQfQnz1zBhZNus1OD84pxv%2Ftd4mpD17BM6EQAAAAABAAAABkYWxlcGFwaS50ZXN0bmV019g2Y1DPtOjGuld6oQ9tkKaS1X49bt%2BdSAs%2BTJ8bSiMBAAAAAwAAAKHtzM4bwtMAAAAAAAA%3D","https://localhost:3001")}>Send Transaction</button>
  <button onClick={calimeroSdk.signOut}>Logout</button>
</div>;

const PublicComponent = () => <div>
  <button onClick={calimeroSdk.signIn}>Login with NEAR</button>
</div>;

export default function Dashboard() {
  useEffect(()=>{
    calimeroSdk.setCredentials();
  },[])

  return calimeroSdk.isSignedIn() ? <PrivateComponent /> : <PublicComponent />;
};
