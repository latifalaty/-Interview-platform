import speech_recognition as sr

def transcribe_audio(blob_url):
    recognizer = sr.Recognizer()
    with sr.AudioFile(blob_url) as source:
        audio_data = recognizer.record(source)
        text = recognizer.recognize_sphinx(audio_data)
        return text

if __name__ == "__main__":
    import sys
    blob_url = sys.argv[1]
    text = transcribe_audio(blob_url)
    print(text)
