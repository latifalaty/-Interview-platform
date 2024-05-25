import dlib
import cv2
import numpy as np

# Charger le détecteur de visage pré-entraîné
detector = dlib.get_frontal_face_detector()

# Charger le modèle de prédiction de visage pré-entraîné
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

# Charger le modèle de reconnaissance faciale pré-entraîné
face_rec_model = dlib.face_recognition_model_v1("dlib_face_recognition_resnet_model_v1.dat")

def compare_faces(image_path1, image_path2):
    # Charger les images de visage
    image1 = cv2.imread(image_path1)
    image2 = cv2.imread(image_path2)

    # Convertir les images en noir et blanc (grayscale)
    gray_image1 = cv2.cvtColor(image1, cv2.COLOR_BGR2GRAY)
    gray_image2 = cv2.cvtColor(image2, cv2.COLOR_BGR2GRAY)

    # Détecter les visages dans les images
    faces1 = detector(gray_image1)
    faces2 = detector(gray_image2)

    # Extraire les caractéristiques du visage
    face_descriptor1 = None
    face_descriptor2 = None

    if len(faces1) > 0:
        # Obtenir les repères du visage pour la première image
        shape1 = predictor(gray_image1, faces1[0])
        # Convertir les repères du visage en vecteur de caractéristiques
        face_descriptor1 = face_rec_model.compute_face_descriptor(gray_image1, shape1)

    if len(faces2) > 0:
        # Obtenir les repères du visage pour la deuxième image
        shape2 = predictor(gray_image2, faces2[0])
        # Convertir les repères du visage en vecteur de caractéristiques
        face_descriptor2 = face_rec_model.compute_face_descriptor(gray_image2, shape2)

    # Comparer les vecteurs de caractéristiques des visages
    if face_descriptor1 is not None and face_descriptor2 is not None:
        # Calculer la distance euclidienne entre les deux vecteurs de caractéristiques
        euclidean_distance = np.linalg.norm(np.array(face_descriptor1) - np.array(face_descriptor2))

        # Définir un seuil de similarité
        threshold = 0.6

        # Si la distance euclidienne est inférieure au seuil, les visages sont considérés comme les mêmes
        if euclidean_distance < threshold:
            print("Les visages sont les mêmes (similarité élevée)")
            return True
        else:
            print("Les visages sont différents (similarité faible)")
            return False
    else:
        print("Impossible de détecter les visages dans au moins une des images")
        return False

# Exemple d'utilisation de la fonction
result = compare_faces("face1.jpg", "face2.jpg")
print("Résultat de la comparaison des visages:", result)
