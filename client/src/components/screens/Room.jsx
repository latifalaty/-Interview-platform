import React, { useEffect, useCallback, useState } from "react";

import { useReactMediaRecorder } from "react-media-recorder";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import Video from "../Video";
import axios from 'axios';

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isConnected, setIsConnected] = useState(false);
  const email = localStorage.getItem('usermail');
  const videoRecorder = useReactMediaRecorder({ screen: true });
  
  const [mediaUrl, setMediaurl] = useState("");
  const recordVideo = useCallback(() => {
    videoRecorder.startRecording();
    alert("recording started");
  }, [videoRecorder]);

  const stopRecording = async () => {
    videoRecorder.stopRecording();
    const videoUrl = videoRecorder.mediaBlobUrl;
    setMediaurl(videoUrl);
    alert("record stopped");
  
    try {
      await axios.post('http://localhost:8009/api/video-record', { email, videoUrl });
      alert('Video recorded successfully and saved to the database');
    } catch (error) {
      console.error(error);
      console.log(videoUrl)
    }
  };
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
    setIsConnected(true);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);
  
  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );
  
  const sendStreams = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach(track => {
        const senders = peer.peer.getSenders();
        const alreadyAdded = senders.some(sender => sender.track === track);
  
        if (!alreadyAdded) {
          peer.peer.addTrack(track, myStream);
        }
      });
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px", width: "50%", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr" }}>
      <h2>welcome to the room</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {/* Affichage de la vidéo distante */}
        {remoteStream && remoteStream instanceof MediaStream && (
          <div>
            <h1>Remote Stream</h1>
            <Video  url={remoteStream}/>
          </div>
        )}
      
        {/* Affichage de la vidéo locale */}
        {myStream && (
          <div>
            <h1>My Stream</h1>
            <ReactPlayer
              playing
              muted
              height="80%"  // Augmentation de la hauteur à 60%
              width="100%" // Utilisation de toute la largeur disponible
              url={myStream} // Assurez-vous que myStream est une URL valide ici
            />
          </div>
        )}
      </div>
  
      <div style={{ textAlign: "center", marginTop: "50px", width: "50%", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr" }}>
        {/* Boutons de déconnexion */}
        <div style={{ marginBottom: "20px" }}>
        
  
          <button 
            onClick={sendStreams}
          >
          </button>
  
          {remoteSocketId  && isConnected &&
            <button 
              style={{ 
                padding: "10px 20px", 
                fontSize: "20px", 
                backgroundColor: "#007bff", 
                color: "#fff", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer",
                marginRight: "10px"
              }} 
              onClick={handleCallUser}
            >
              CALL
            </button>
          }
        </div>
        {remoteSocketId  && myStream &&
        <div style={{ display: "flex", justifyContent: "center", marginTop: "0px" }}>
          {/* Bouton d'enregistrement */}
          
          <div style={{ marginBottom: "20px" }}>
          <button style={{ 
                padding: "10px 20px", 
                fontSize: "20px", 
                backgroundColor: "#007bff", 
                color: "#fff", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer",
                marginRight: "10px"
              }}   onClick={recordVideo}>
            <span> Video Recording</span>
          </button></div>
          <div style={{ marginBottom: "20px" }}>
          <button style={{ 
                padding: "10px 20px", 
                fontSize: "20px", 
                backgroundColor: "#007bff", 
                color: "#fff", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer",
                marginRight: "10px"
              }}  onClick={stopRecording}>
          <span>Stop Recording</span>
        </button></div>
        <a className="download-href" href={mediaUrl} download="video.mp4">
              <button style={{ 
                padding: "10px 20px", 
                fontSize: "20px", 
                backgroundColor: "#007bff", 
                color: "#fff", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer",
                marginRight: "10px"
              }} >Download video</button>
            </a>
          
          
        </div>}
        
      </div>
    </div>
  );
};

export default RoomPage;
