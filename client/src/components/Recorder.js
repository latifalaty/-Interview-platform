import React, { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

function Recording() {
  const [popup, setPopup] = useState(false);
  const videoRecorder = useReactMediaRecorder({ video: true, audio: true });
  const screenRecorder = useReactMediaRecorder({ screen: true });
  
  const [mediaUrl, setMediaUrl] = useState("");
  const [choice, setChoice] = useState("");

  const recordScreen = () => {
    setChoice("screen");
    screenRecorder.startRecording();
  };
  
  const recordVideo = () => {
    setChoice("video");
    videoRecorder.startRecording();
  };

  const stopRecording = async () => {
    if (choice === "video") {
      videoRecorder.stopRecording();
      const response = await fetch("http://localhost:5000/api/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mediaUrl: videoRecorder.mediaBlobUrl }),
      });
      // Si tu veux obtenir la réponse JSON de la requête :
      // const data = await response.json();
    } else if (choice === "screen") {
      screenRecorder.stopRecording();
    }
    setPopup(true);
  };

  const status =
    choice === "video"
      ? videoRecorder.status
      : choice === "screen"
        ? screenRecorder.status
        : "idle";

  const closePopup = () => {
    setPopup(false);
  };

  return (
    <div className="btn-record-division">
      {status === "idle" || status === "stopped" ? (
        <>
          <button className="recording-btn" onClick={recordVideo}>
            <span>Start Video Recording</span>
          </button>
          <button className="recording-btn" onClick={recordScreen}>
            <span>Start Screen Recording</span>
          </button>
        </>
      ) : (
        <button className="recording-btn" onClick={stopRecording}>
          <span>Stop Recording</span>
        </button>
      )}

      {popup && (
        <Popup
          open={popup}
          onClose={closePopup}
          modal
          closeOnDocumentClick
          margin={"10px"}
        >
          <div className="modal-content">
            <a className="download-href" href={mediaUrl} download="video.mp4">
              <button className="popup-btn">Download File</button>
            </a>
            <button className="popup-btn btn-close" onClick={closePopup}>
              <span>Back</span>
            </button>
          </div>
        </Popup>
      )}
    </div>
  );
}

export default Recording;
