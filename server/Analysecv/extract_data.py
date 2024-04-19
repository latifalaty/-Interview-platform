import os
import sys
import requests
import tempfile
import json
import pdfplumber
import pytesseract
import cv2
import numpy as np
import fitz
from PIL import Image

STATIC_FOLDER = "static"

def download_pdf_from_url(pdf_url):
    response = requests.get(pdf_url)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
        f.write(response.content)
        return f.name

def extract_text_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ''
        for page in pdf.pages:
            text += page.extract_text()
    return text

def extract_text_from_image(image_path):
    text = pytesseract.image_to_string(Image.open(image_path))
    return text

def extract_face_from_pdf(pdf_path, output_dir):
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    extracted_faces_paths = []  # Liste pour stocker les chemins des fichiers PNG extraits
    
    # Ouvrez le PDF
    pdf_document = fitz.open(pdf_path)
    
    for page_num in range(pdf_document.page_count):
        page = pdf_document.load_page(page_num)
        # Convertissez la page PDF en image au format RGB
        pix = page.get_pixmap(matrix=fitz.Matrix(1, 1))
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        # Convertissez l'image en tableau numpy
        img_np = np.array(img)
        
        # Convertissez l'image en niveau de gris
        gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
        # Détection des visages
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        # Dessinez une boîte autour de chaque visage détecté et enregistrez-le en tant que fichier PNG
        for i, (x, y, w, h) in enumerate(faces):
            cv2.rectangle(img_np, (x, y), (x+w, y+h), (0, 255, 0), 2)
            face = img_np[y:y+h, x:x+w]
            face_img = Image.fromarray(face)
            # Format du nom de fichier
            face_filename = f"face_page{page_num+1}_face{i+1}.png"
            face_path = os.path.join(output_dir, face_filename)
            face_img.save(face_path)
            extracted_faces_paths.append(face_filename)
    
    return extracted_faces_paths

def extract_face_from_image(image_path):
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    extracted_faces = []
    for (x, y, w, h) in faces:
        face = image[y:y+h, x:x+w]
        extracted_faces.append(face.tolist())  # Convertir le tableau numpy en liste
    
    return extracted_faces

if __name__ == "__main__":
    file_type = sys.argv[1]
    file_path = sys.argv[2]

    extracted_faces = []  # Initialisation de la variable extracted_faces
    
    if file_type == 'pdf':
        if file_path.startswith('http://') or file_path.startswith('https://'):
            file_path = download_pdf_from_url(file_path)
        extracted_text = extract_text_from_pdf(file_path)
        output_dir = os.path.join(STATIC_FOLDER, "extracted_faces")  # Répertoire de sortie pour les fichiers PNG extraits
        os.makedirs(output_dir, exist_ok=True)  # Créer le répertoire s'il n'existe pas
        extracted_faces = extract_face_from_pdf(file_path, output_dir)
    elif file_type in ['png', 'jpg', 'jpeg']:
        extracted_text = extract_text_from_image(file_path)
        output_dir = "./extracted_faces"  # Répertoire de sortie pour les fichiers PNG extraits
        extracted_faces = extract_face_from_image(file_path, output_dir)
    
    # Format des chemins relatifs pour les fichiers images
    extracted_faces = [os.path.join("extracted_faces", filename) for filename in extracted_faces]


    # Organiser le texte extrait en sections distinctes
    sections = {}
    section_titles = ["Contact","Expériences", "Langues", "Études / Diplômes", "Formations complémentaires"]
    for title in section_titles:
        start_index = extracted_text.find(title)
        end_index = extracted_text.find(section_titles[section_titles.index(title) + 1]) if section_titles.index(title) < len(section_titles) - 1 else len(extracted_text)
        sections[title] = extracted_text[start_index:end_index].strip() if start_index != -1 else ""

    print(json.dumps({"extracted_text": sections, "extracted_faces": extracted_faces}, indent=4))
