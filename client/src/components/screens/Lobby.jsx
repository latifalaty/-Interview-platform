import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px", width: "50%", margin: "0 auto" }}>
  <h1 style={{ marginBottom: "20px" }}>Interview</h1>
  <form onSubmit={handleSubmitForm} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ display: "flex", flexDirection: "row", marginBottom: "20px" }}>
      <label htmlFor="email" style={{ width: "100px", marginRight: "10px", textAlign: "left" }}>Email ID</label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "5px", width: "300px" }}
      />
    </div>
    <div style={{ display: "flex", flexDirection: "row", marginBottom: "20px" }}>
      <label htmlFor="room" style={{ width: "100px", marginRight: "10px", textAlign: "left" }}>Room Number</label>
      <input
        type="text"
        id="room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        style={{ padding: "5px", width: "300px" }}
      />
    </div>
    <button style={{ padding: "10px 20px", fontSize: "20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Join</button>
  </form>
</div>

  );
};

export default LobbyScreen;
