from pymongo import MongoClient

# Se connecter à la base de données MongoDB
client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['Entretien']
collection = db['emotions']

# Récupérer les données de la collection
data = collection.find({})

# Initialiser un dictionnaire pour stocker les pourcentages d'émotions par email
emotion_percentages_by_email = {}

# Traiter chaque document
for entry in data:
    email = entry.get("email")
    emotions = entry.get("emotions")
    
    if email and emotions:
        # Si l'email n'est pas déjà dans le dictionnaire, l'initialiser avec un dictionnaire vide
        if email not in emotion_percentages_by_email:
            emotion_percentages_by_email[email] = {}
        # Ajouter les pourcentages d'émotions à l'email correspondant dans le dictionnaire
        for emotion_obj in emotions:
            emotion = emotion_obj["emotion"]
            percentage = emotion_obj["percentage"]
            if emotion not in emotion_percentages_by_email[email]:
                emotion_percentages_by_email[email][emotion] = 0
            emotion_percentages_by_email[email][emotion] += percentage

# Afficher les résultats
for email, percentages in emotion_percentages_by_email.items():
    print(f"Email: {email}")
    
    # Trier les émotions par pourcentage décroissant
    sorted_emotions = sorted(percentages.items(), key=lambda x: x[1], reverse=True)
    
    # Afficher les deux émotions ayant les pourcentages les plus élevés
    print("Deux émotions principales :")
    for emotion, percentage in sorted_emotions[:2]:
        print(f"{emotion.capitalize()}: {percentage:.2f}%")
    
    # Afficher les quatre autres émotions dans l'ordre décroissant
    print("Quatre autres émotions :")
    for emotion, percentage in sorted_emotions[2:6]:
        print(f"{emotion.capitalize()}: {percentage:.2f}%")
    
    print()
