import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from "face-api.js";
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

const Video = (props) => {
  const videoRef = useRef();
  const canvasRef = useRef();

  const startVideo = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
        videoRef.current.onloadedmetadata = () => {
          faceDetection();
        };
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const loadModels = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      tf.setBackend('webgl'),
    ]);
  };

  const faceDetection = async () => {
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
      faceapi.matchDimensions(canvasRef.current, videoRef.current, true);

      const resizedDetections = faceapi.resizeResults(detections, {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });

      const context = canvasRef.current.getContext('2d');
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

      // Extract emotions and send to backend with email from local storage
      const emotions = resizedDetections.map(detection => detection.expressions);
      const email = localStorage.getItem('usermail'); // Get email from local storage
      sendEmotions(emotions, email);

    }, 1000);
  };

  const sendEmotions = async (emotions, email) => {
    try {
      const response = await axios.post('/api/save-emotions', { emotions, email });
      console.log('Emotions sent successfully:', response.data); 
      console.log('Emotions sent successfully:', email);// Handle successful response
    } catch (error) {
      console.error('Error sending emotions:', error);
    }
  };

  useEffect(() => {
    startVideo();
    loadModels();
  }, [startVideo]);

  return (
    <div className="video-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <video
        ref={videoRef}
        style={{
          width: "auto",
          height: "70%",
          maxHeight: "70vh",
          borderRadius: "8px",
        }}
        muted
        autoPlay
        playsInline
        videoConstraints={{ facingMode: "user" }}
        mirrored={true}
      />
      <canvas ref={canvasRef} className='canvas' style={{ position: 'absolute', top: '20', left: '10' }} />
    </div>
  );
};

export default Video;
