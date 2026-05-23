import { useState, useEffect } from "react";

// Connection Management Hook
function useConnection(peer, partyBId, setPartyBId) {
  // State Management
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeConn, setActiveConn] = useState(null);
  const [yourName, setYourName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [incomingCallRequest, setIncomingCallRequest] = useState(null);

  // Peer Connection Listener
  useEffect(() => {
    if (peer) {
      peer.on("connection", (conn) => {
        conn.on("data", (data) => {
          // Connection Request Handler
          if (data.type === "connection-request") {
            setIncomingRequest({
              fromId: data.fromId,
              fromName: data.fromName,
              conn,
            });
          }

          // Disconnect Handler
          else if (data.type === "disconnected") {
            setConnectionStatus("idle");
            setActiveConn(null);
            setPartyBId("");
            setRecipientName("");

            alert(`${data.fromName} has disconnected!`);
          }

          // Incoming Call Request Handler
          else if (data.type === "call-request") {
            setIncomingCallRequest({ fromName: data.fromName });
          }

          // Call Rejection Handler
          else if (data.type === "call-rejected") {
            alert(`${recipientName} rejected your call!`);
          }
        });

        // Connection Close Listener
        conn.on("close", () => {
          setConnectionStatus("idle");
          setActiveConn(null);
          setPartyBId("");
          setRecipientName("");

          alert("The other person has disconnected!");
        });
      });
    }
  }, [peer]);

  // Send Connection Request
  function sendConnectionRequest() {
    // Name Validation
    if (!yourName.trim()) {
      alert("Please enter your name first!");
      return;
    }

    // Recipient ID Validation
    if (!partyBId) {
      alert("Please enter a recipient ID first!");
      return;
    }

    // Peer Connection Initialization
    const conn = peer.connect(partyBId);

    // Connection Validation
    if (!conn) {
      alert("Could not reach that ID. Please check and try again!");
      return;
    }

    // Connection Open Handler
    conn.on("open", () => {
      conn.send({
        type: "connection-request",
        fromId: peer.id,
        fromName: yourName,
      });

      setConnectionStatus("pending");
      setActiveConn(conn);
    });

    // Connection Data Listener
    conn.on("data", (data) => {
      // Connection Accepted Handler
      if (data.type === "connection-accepted") {
        setRecipientName(data.fromName);
        setConnectionStatus("connected");
      }

      // Connection Rejected Handler
      else if (data.type === "connection-rejected") {
        alert("Your connection request was rejected!");

        setConnectionStatus("idle");
      }

      // Disconnect Handler
      else if (data.type === "disconnected") {
        setConnectionStatus("idle");
        setActiveConn(null);
        setPartyBId("");
        setRecipientName("");

        alert("The other person has disconnected!");
      }

      // Incoming Call Request Handler
      else if (data.type === "call-request") {
        setIncomingCallRequest({ fromName: data.fromName });
      }

      // Call Rejection Handler
      else if (data.type === "call-rejected") {
        alert(`${recipientName} rejected your call!`);
      }
    });

    // Connection Close Listener
    conn.on("close", () => {
      setConnectionStatus("idle");
      setActiveConn(null);
      setPartyBId("");
      setRecipientName("");

      alert("The other person has disconnected!");
    });
  }

  // Accept Incoming Connection
  function acceptConnection(name) {
    // Name Validation
    if (!name.trim()) {
      alert("Please enter your name first!");
      return;
    }

    if (incomingRequest) {
      incomingRequest.conn.send({
        type: "connection-accepted",
        fromName: name,
      });

      setYourName(name);
      setPartyBId(incomingRequest.fromId);
      setRecipientName(incomingRequest.fromName);
      setActiveConn(incomingRequest.conn);
      setConnectionStatus("connected");
      setIncomingRequest(null);

      // Connection Close Listener
      incomingRequest.conn.on("close", () => {
        setConnectionStatus("idle");
        setActiveConn(null);
        setPartyBId("");
        setRecipientName("");

        alert("The other person has disconnected!");
      });
    }
  }

  // Reject Incoming Connection
  function rejectConnection() {
    if (incomingRequest) {
      incomingRequest.conn.send({ type: "connection-rejected" });

      setIncomingRequest(null);
    }
  }

  // Disconnect Active Connection
  function disconnect(name) {
    if (activeConn) {
      activeConn.send({ type: "disconnected", fromName: name });

      activeConn.close();
    }

    setConnectionStatus("idle");
    setActiveConn(null);
    setPartyBId("");
    setRecipientName("");
  }

  // Send Call Request
  function sendCallRequest(name) {
    if (activeConn) {
      activeConn.send({ type: "call-request", fromName: name });
    }
  }

  // Accept Incoming Call Request
  function acceptCallRequest() {
    setIncomingCallRequest(null);
  }

  // Reject Incoming Call Request
  function rejectCallRequest() {
    if (activeConn) {
      activeConn.send({ type: "call-rejected" });
    }

    setIncomingCallRequest(null);
  }

  // Hook Return Values
  return {
    connectionStatus,
    incomingRequest,
    incomingCallRequest,
    yourName,
    setYourName,
    recipientName,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    disconnect,
    sendCallRequest,
    acceptCallRequest,
    rejectCallRequest,
  };
}

// Export Hook
export default useConnection;
