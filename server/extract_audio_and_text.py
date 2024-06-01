import subprocess
import os
import sys
import json
import requests
import moviepy.editor as mp
import speech_recognition as sr
import re
from concurrent.futures import ThreadPoolExecutor

def download_video_from_url(url, output_file):
    try:
        response = requests.get(url)
        with open(output_file, 'wb') as f:
            f.write(response.content)
        return output_file
    except Exception as e:
        print(f"Erreur lors du téléchargement du fichier vidéo: {str(e)}")
        return None

def convert_video(input_file, output_file):
    try:
        result = subprocess.run(['ffmpeg', '-i', input_file, '-c:v', 'libx264', '-c:a', 'aac', '-strict', 'experimental', output_file], check=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Erreur lors de la conversion: {result.stderr}")
            return None
        return output_file
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors de la conversion: {e.stderr}")
        return None
    except Exception as e:
        print(f"Une erreur s'est produite: {str(e)}")
        return None

def split_video(input_file, segment_length):
    try:
        video = mp.VideoFileClip(input_file)
        total_duration = video.duration
        segments = []
        for i in range(0, int(total_duration), segment_length):
            segment_file = f'segment_{i}.mp4'
            video.subclip(i, min(i + segment_length, total_duration)).write_videofile(segment_file, codec='libx264', audio_codec='aac')
            segments.append(segment_file)
        return segments
    except Exception as e:
        print(f"Erreur lors du découpage de la vidéo: {str(e)}")
        return []

def extract_text_from_audio(segment):
    try:
        audio = mp.AudioFileClip(segment)
        audio.write_audiofile("output_audio.wav", codec='pcm_s16le')

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
   

def clean_text(text):
    text = text.lower()
    replacements = {
        '�': 'é',
        '\\u00e9': 'é',
        '\\u00e0': 'à',
        '\\u00e7': 'ç',
        '\\u00e8': 'è',
        '\\u00f4': 'ô',
        '\\u00fb': 'û',
        '\\u00e2': 'â',
        '\\u00ee': 'î',
        '\\u00f9': 'ù',
        '\\u00eb': 'ë',
        '\\u00ef': 'ï',
        '\\u00fc': 'ü'
    }
    for key, value in replacements.items():
        text = text.replace(key, value)
    text = re.sub(r'[^a-z\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

def process_segment(segment):
    text = extract_text_from_audio(segment)
    if text:
        cleaned_text = clean_text(text)
        return cleaned_text
    return ""

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python extract_audio_and_text.py <video_url>")
        sys.exit(1)
    
    video_url = sys.argv[1]
    
    video_file = download_video_from_url(video_url, "input_video.mp4")
    if not video_file:
        print("Erreur: Impossible de télécharger le fichier vidéo depuis l'URL spécifiée.")
        sys.exit(1)
    
    converted_video = convert_video(video_file, "converted_video.mp4")
    if not converted_video:
        print("Erreur: Impossible de convertir le fichier vidéo.")
        sys.exit(1)
    
    segments = split_video(converted_video, segment_length=10)
    if not segments:
        print("Erreur: Aucun segment n'a été créé.")
        sys.exit(1)
    
    with ThreadPoolExecutor() as executor:
        all_text = list(executor.map(process_segment, segments))
    
    full_text = ' '.join(all_text)
    print(f"Texte extrait: {full_text}")
    
    result = {"extracted_text": full_text}
    print(json.dumps(result))

    for segment in segments:
        os.remove(segment)
