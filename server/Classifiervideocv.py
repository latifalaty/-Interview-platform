import json
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from collections import Counter
import string
import math

# Function to calculate cosine similarity between two texts
def cosine_similarity(text1, text2):
    tokens1 = word_tokenize(text1.lower())
    tokens2 = word_tokenize(text2.lower())
    tokens1 = [word for word in tokens1 if word.isalnum() and word not in stopwords.words('english')]
    tokens2 = [word for word in tokens2 if word.isalnum() and word not in stopwords.words('english')]
    vector1 = Counter(tokens1)
    vector2 = Counter(tokens2)
    dot_product = sum(vector1[key] * vector2[key] for key in vector1 if key in vector2)
    magnitude1 = math.sqrt(sum(vector1[key] ** 2 for key in vector1))
    magnitude2 = math.sqrt(sum(vector2[key] ** 2 for key in vector2))
    if magnitude1 == 0 or magnitude2 == 0:
        return 0
    else:
        return dot_product / (magnitude1 * magnitude2)

# Function to classify and sort CV-Video pairs based on text similarity
def classify_and_sort_cv_video_pairs(cv_video_pairs):
    for pair in cv_video_pairs:
        cv_text = pair['cv_text']
        video_text = pair['video_text']
        similarity = cosine_similarity(cv_text, video_text)
        pair['similarity'] = similarity

    sorted_pairs = sorted(cv_video_pairs, key=lambda x: x['similarity'], reverse=True)
    return sorted_pairs

if __name__ == "__main__":
    with open('cv_video_pairs.json', 'r') as file:
        cv_video_pairs = json.load(file)
    threshold = 0.7
    sorted_pairs = classify_and_sort_cv_video_pairs(cv_video_pairs)
    print(json.dumps(sorted_pairs))
