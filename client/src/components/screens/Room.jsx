import React, { useEffect, useCallback, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import Video from "../Video";
import axios from 'axios';
import Analyse from "../Analyse";
import OfferQuestions from "../ConsulterQuestion";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isConnected, setIsConnected] = useState(false);
  const email = localStorage.getItem('usermail');
  const videoRecorder = useReactMediaRecorder({ screen: true });
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const recordVideo = useCallback(() => {
    videoRecorder.startRecording();
    alert("Recording started");
  }, [videoRecorder]);

  const stopRecording = async () => {
    try {
      videoRecorder.stopRecording();
      const videoUrl = videoRecorder.mediaBlobUrl;
      setRecordedVideoUrl(videoUrl);
      setDownloadUrl(videoUrl); // Update the saved URL
      if (videoUrl) {
        const response = await fetch(videoUrl);
        const videoBlob = await response.blob();
        const myFile = new File([videoBlob], "demo.mp4", { type: 'video/mp4' });
  
        // Envoi du fichier au backend
        const formData = new FormData();
        formData.append('email', email);
        formData.append('video', myFile); // Ajoutez le fichier à FormData
  
        await axios.post('http://localhost:8009/api/video-record', formData, {
          headers: {
            'Content-Type': 'multipart/form-data' // Assurez-vous que le type de contenu est défini sur 'multipart/form-data'
          }
        });
  
        alert('Video recorded successfully ');
        await axios.post('http://localhost:8009/analyse');
      } else {
        console.error('No recorded video available');
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleDownload = () => {
    if (recordedVideoUrl) {
      const link = document.createElement('a');
      link.href = recordedVideoUrl;
      link.setAttribute('download', 'video.mp4');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('No recorded video available for download');
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
    // Start call when component mounts
    handleCallUser();
  }, [handleCallUser]);

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
            <ReactPlayer
              playing
              muted
              height="80%"  
              width="100%" url={remoteStream}/>
          </div>
        )}
      
        {/* Affichage de la vidéo locale */}
        {myStream && (
          <div>
            <h1>My Stream</h1>
            <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, marginRight: '20px' }}>
        <Video url={myStream} />
      </div>
      <div style={{ flex: 1, marginLeft: '20px',marginTop:'20%' }}>
        <OfferQuestions/>
      </div>
    </div>
          </div>
        )}
      </div>
  
      <div style={{ textAlign: "center", marginTop: "50px", width: "50%", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr" }}>
        {/* Boutons de déconnexion */}
        <div style={{ marginBottom: "20px" }}>
          <button onClick={sendStreams}></button>
          {isConnected &&
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
        {/* Affichage des boutons d'enregistrement */}
        {myStream &&
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
              <span> Record Video</span>
            </button>
          </div>
          {/* Bouton d'arrêt d'enregistrement */}
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
            </button>
          </div>
     
        </div>}
       {/* Affichage de la vidéo enregistrée si elle existe */}
       {recordedVideoUrl && (
        <div>
          <h1>Recorded Video</h1>
          <video controls src={recordedVideoUrl} style={{ width: "100%", maxHeight: "80%" }} />
        </div>
      )}
      </div>
    </div>
  );
};

export default RoomPage;
