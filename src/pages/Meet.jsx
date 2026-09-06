import React from "react";
import { useSearchParams } from "react-router-dom";
import PeerToPeerMessaging from "../components/PeerToPeerMessaging";

// Meet Page
// Hosts the peer-to-peer chat / video interface. A "?peer=<id>" query param
// (from a shared invite link) pre-fills the recipient's ID.
function Meet() {
  const [params] = useSearchParams();
  const invitedPeer = params.get("peer") || "";

  return <PeerToPeerMessaging initialRecipientId={invitedPeer} />;
}

// Export Component
export default Meet;
