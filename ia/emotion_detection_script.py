import cv2
import json
import numpy as np
from tensorflow.keras.models import load_model

# Load the trained Keras model
model = load_model('emotion_detection_model.h5')

# Define emotion labels
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

# Function to detect facial emotions
def detect_emotions():
    # Open the webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Unable to open webcam.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Unable to capture frame.")
            break
        
        # Perform facial emotion detection on the frame
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        resized_frame = cv2.resize(gray_frame, (48, 48))
        normalized_frame = resized_frame / 255.0
        reshaped_frame = normalized_frame[np.newaxis, :, :, np.newaxis]
        
        # Predict the emotion
        prediction = model.predict(reshaped_frame)
        max_index = np.argmax(prediction)
        detected_emotion = emotion_labels[max_index]

        # Print the detected emotion
        print("Detected Emotion:", detected_emotion)

        cv2.imshow('Webcam', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    detect_emotions()
