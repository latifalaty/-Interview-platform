import librosa

def process_wav_file(wav_path):
    # Charger le fichier WAV
    y, sr = librosa.load(wav_path)

    # Exemple de traitement : calcul du tempo (rythme) du fichier audio
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

    # Autres exemples de traitement peuvent être ajoutés ici

    return tempo

wav_path = "D:/platforme entretien/server/uploads/video-1714306718872.wav" # Path to your WAV file

tempo = process_wav_file(wav_path)
print("Tempo du fichier audio:", tempo)


