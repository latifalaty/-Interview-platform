import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "./Dashboardw.css";

function Camera(props) {
  return (
    <div>
      {props.permisssions && (
        <Webcam
          style={{
            width: "400%",
            height: "400px",
            width:"400px",
            maxWidth: "478px",
            borderRadius: "8px",
            marginTop: "2px",
          }}
          videoConstraints={{ facingMode: "user" }}
          mirrored={true}
        />
      )}
    </div>
  );
}

export default Camera;