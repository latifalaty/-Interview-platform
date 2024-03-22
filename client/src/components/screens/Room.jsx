import React, { useEffect, useCallback, useState } from "react";

import { useReactMediaRecorder } from "react-media-recorder";
import ReactPlayer from "react-player";
import RecordRTC from "recordrtc";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import Video from "../Video";

import { Link } from 'react-router-dom';

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isConnected, setIsConnected] = useState(false);
  
  const videoRecorder = useReactMediaRecorder({ video: true, audio: true });
  
  const [mediaUrl, setMediaurl] = useState("");
  const [recorder, setRecorder] = useState(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null); // Nouvel état pour stocker le fichier vidéo enregistré
  const recordVideo = useCallback(() => {
    videoRecorder.startRecording();
    alert("recording started");
  }, [videoRecorder]);

  const stopRecording = () => {
      videoRecorder.stopRecording();
      setMediaurl(videoRecorder.mediaBlobUrl);
      alert("record stopped")
 
  };
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
    setIsConnected(true);
  }, []);

  const handleDisconnect = useCallback(() => {
  
    // Arrêter l'enregistrement si en cours
    if (recorder) {
      recorder.stopRecording(() => {
        setRecordedVideoBlob(recorder.getBlob()); // Récupérer le blob du fichier enregistré
      //  recorder.save(); // Télécharger l'enregistrement
      alert(" record sucess!");
      });
    }

  }, [recorder]);

  const handleRecordScreen = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
        audio: true
      });
  
      // Obtenez une liste des périphériques audio disponibles
      const devices = await navigator.mediaDevices.enumerateDevices();
  
      // Recherchez le périphérique audio externe (par exemple, une entrée de ligne)
      const externalAudioDevice = devices.find(device => device.kind === 'audioinput' && device.label !== 'Default');
  
      // Si un périphérique audio externe est trouvé, utilisez-le pour le flux audio
      if (externalAudioDevice) {
        const constraints = {
          audio: {
            deviceId: { exact: externalAudioDevice.deviceId },
          },
        };
  
        // Obtenez le flux audio à partir du périphérique externe
        const externalAudioStream = await navigator.mediaDevices.getUserMedia(constraints);
  
        // Combinez le flux vidéo avec le flux audio externe
        const combinedStream = new MediaStream([...stream.getTracks(), ...externalAudioStream.getTracks()]);
  
        const recorder = RecordRTC(combinedStream, { type: "video" });
        recorder.startRecording();
        setRecorder(recorder);
      } else {
        console.log("No external audio device found");
      }
    } catch (error) {
      console.error("Error accessing media devices: ", error);
    }
  }, []);
  
  

  const handleDownloadRecord = useCallback(() => {
    if (recordedVideoBlob) {
      const url = URL.createObjectURL(recordedVideoBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'recorded_screen.mp4';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }, [recordedVideoBlob]);

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
        {remoteSocketId  && myStream &&
          <button 
            style={{ 
              padding: "10px 20px", 
              fontSize: "20px", 
              backgroundColor: "#dc3545", 
              color: "#fff", 
              border: "none", 
              borderRadius: "5px", 
              cursor: "pointer",
              marginRight: "10px"
            }} 
            onClick={handleDisconnect}
          >
          Stop recording screen
          </button>}
  
          <button 
            onClick={sendStreams}
          >
          </button>
  
          {remoteSocketId  && 
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
            <button 
              style={{ 
                padding: "10px 20px", 
                fontSize: "20px", 
                backgroundColor: "#28a745", 
                color: "#fff", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer",
                marginRight: "10px"
              }} 
              onClick={handleRecordScreen}
            >
              Record screen
            </button>
          </div>
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
          {/* Bouton de téléchargement */}
          <div style={{ marginBottom: "20px" }}>
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
              onClick={handleDownloadRecord}
            >
              Download screen
            </button>
          </div>
          
        </div>}
        
      </div>
    </div>
  );
};

export default RoomPage;
