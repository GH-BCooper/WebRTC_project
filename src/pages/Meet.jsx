import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PeerToPeerMessaging from "../components/PeerToPeerMessaging";
import { getSession } from "../lib/sessions";

// Meet Page
// Hosts the peer-to-peer chat / video room. Two optional query params:
//   ?peer=<id>  — pre-fills the recipient's Peer ID (from an invite link)
//   ?s=<id>     — opens the room for a saved OfficeHours session (topic,
//                 agenda and a place to store the AI recap)
function Meet() {
  const [params] = useSearchParams();
  const invitedPeer = params.get("peer") || "";
  const sessionId = params.get("s") || "";
  const session = useMemo(() => getSession(sessionId), [sessionId]);

  return (
    <PeerToPeerMessaging initialRecipientId={invitedPeer} session={session} />
  );
}

// Export Component
export default Meet;
