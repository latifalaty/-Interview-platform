# Importation des bibliothèques nécessaires
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from collections import Counter
import string
import math

# Fonction pour calculer la similarité cosinus entre deux textes
def cosine_similarity(text1, text2):
    # Tokenization
    tokens1 = word_tokenize(text1.lower())
    tokens2 = word_tokenize(text2.lower())

    # Remove punctuation and stop words
    tokens1 = [word for word in tokens1 if word.isalnum() and word not in stopwords.words('english')]
    tokens2 = [word for word in tokens2 if word.isalnum() and word not in stopwords.words('english')]

    # Count word frequencies
    vector1 = Counter(tokens1)
    vector2 = Counter(tokens2)

    # Calculate dot product
    dot_product = sum(vector1[key] * vector2[key] for key in vector1 if key in vector2)

    # Calculate magnitudes
    magnitude1 = math.sqrt(sum(vector1[key] ** 2 for key in vector1))
    magnitude2 = math.sqrt(sum(vector2[key] ** 2 for key in vector2))

    # Calculate cosine similarity
    if magnitude1 == 0 or magnitude2 == 0:
        return 0
    else:
        return dot_product / (magnitude1 * magnitude2)

# Fonction pour classifier les paires CV-Vidéo en fonction de la similarité de texte
def classify_cv_video_pairs(cv_video_pairs, threshold):
    classified_pairs = []

    for pair in cv_video_pairs:
        cv_text = pair['cv_text']
        video_text = pair['video_text']
        similarity = cosine_similarity(cv_text, video_text)

        if similarity >= threshold:
            classified_pairs.append({'cv_id': pair['cv_id'], 'video_id': pair['video_id'], 'similarity': similarity, 'classification': 'Match'})
        else:
            classified_pairs.append({'cv_id': pair['cv_id'], 'video_id': pair['video_id'], 'similarity': similarity, 'classification': 'No Match'})

    return classified_pairs

# Exemple d'utilisation
# Supposons que vous avez une liste de paires CV-Vidéo avec leur texte extrait
cv_video_pairs = [
    {'cv_id': 1, 'video_id': 1, 'cv_text': 'Texte extrait du CV 1', 'video_text': 'Texte extrait de la vidéo 1'},
    {'cv_id': 2, 'video_id': 2, 'cv_text': 'Texte extrait du CV 2', 'video_text': 'Texte extrait de la vidéo 2'},
    # Ajoutez d'autres paires CV-Vidéo ici...
]

# Définissez un seuil de similarité
threshold = 0.7

# Classifiez les paires CV-Vidéo
classified_pairs = classify_cv_video_pairs(cv_video_pairs, threshold)

# Affichez les résultats
for pair in classified_pairs:
    print(f"CV ID: {pair['cv_id']}, Video ID: {pair['video_id']}, Similarity: {pair['similarity']}, Classification: {pair['classification']}")
