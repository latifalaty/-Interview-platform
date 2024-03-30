import moviepy.editor as mp
import speech_recognition as sr
import sys
import os
import json

def extract_text_from_audio(audio_file):
    try:
        # Convertir la vidéo en audio
        audio = mp.AudioFileClip(audio_file)
        audio.write_audiofile("output_audio.wav", codec='pcm_s16le')

        # Utiliser SpeechRecognition pour transcrire l'audio en texte
        recognizer = sr.Recognizer()
        with sr.AudioFile("output_audio.wav") as source:
            audio_data = recognizer.record(source)
            # Utiliser le modèle de reconnaissance de la parole
            # dans une langue spécifique (par exemple, 'fr-FR' pour le français)
            text = recognizer.recognize_google(audio_data, language='fr-FR')
            return text
    except sr.UnknownValueError:
        print("Erreur: Impossible de reconnaître le discours")
    except sr.RequestError as e:
        print(f"Erreur: La demande de reconnaissance a échoué; {e}")
    except Exception as e:
        print(f"Une erreur s'est produite: {str(e)}")
    return None

if __name__ == "__main__":
    # Vérifier si le chemin du fichier audio est fourni en argument de ligne de commande
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
