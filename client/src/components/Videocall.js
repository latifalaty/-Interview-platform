import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';

const Recruteur = () => {
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const socket = io('http://localhost:8009');

    // Gestion de la réception du flux vidéo
    socket.on('stream', (data) => {
      const remoteStream = new MediaStream();
      remoteStream.addTrack(data.stream.getTracks()[0]);
      remoteVideoRef.current.srcObject = remoteStream;
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startMeeting = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);

    const socket = io('http://localhost:3000');

    // Envoyer le flux vidéo au serveur
    socket.emit('stream', { room: meetingId, stream });

    // Rejoindre la réunion
    socket.emit('joinMeeting', meetingId);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="ID de réunion"
        value={meetingId}
        onChange={(e) => setMeetingId(e.target.value)}
      />
      <button onClick={startMeeting}>Commencer la réunion</button>
      <video ref={remoteVideoRef} autoPlay />
    </div>
  );
};

export default Recruteur;
