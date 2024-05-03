import subprocess
import os
import sys
import json
import moviepy.editor as mp
import speech_recognition as sr

def convert_video(input_file, output_file):
    try:
        subprocess.run(['ffmpeg', '-i', input_file, '-c:v', 'libx264', '-c:a', 'aac', '-strict', 'experimental', output_file], check=True)
       
        return output_file
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors de la conversion: {e}")
    except Exception as e:
        print(f"Une erreur s'est produite: {str(e)}")
    return None

def extract_text_from_audio(audio_file):
    try:
        video_file = convert_video(audio_file, "output_video.mp4")
        audio = mp.AudioFileClip(video_file)
        audio.write_audiofile("output_audio.wav", codec='pcm_s16le')

        # Utiliser SpeechRecognition pour transcrire l'audio en texte
        recognizer = sr.Recognizer()
        with sr.AudioFile("output_audio.wav") as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language='fr-FR')
            
        return text
    except sr.UnknownValueError:
        print("Erreur: Impossible de reconnaître le discours")
    except sr.RequestError as e:
        print(f"Erreur: La demande de reconnaissance a échoué; {e}")
    except Exception as e:
        print(f"Une erreur s'est produite: {str(e)}")
    finally:
        # Supprimer les fichiers temporaires
        if 'video_file' in locals():
            os.remove(video_file)
        if os.path.exists("output_audio.wav"):
            os.remove("output_audio.wav")
    return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python extract_audio_and_text.py <audio_file>")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    
    # Vérifier si le fichier spécifié existe
    if not os.path.isfile(audio_path):
        print("Erreur: Fichier introuvable")
        sys.exit(1)
    
    extracted_text = extract_text_from_audio(audio_path)
    if extracted_text:
        print("Texte extrait:", extracted_text)
    else:
        print("Erreur: Impossible d'extraire du texte de l'audio.")
    # Imprimer le résultat au format JSON
    result = {"extracted_text": extracted_text} if extracted_text else {"error": "Failed to extract text from the audio."}
    print(json.dumps(result))
