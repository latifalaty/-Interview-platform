const express = require("express");
const router = express.Router();
const userdb = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const { SpeechClient } = require('@google-cloud/speech');
const fetch = require('node-fetch');
const authenticate = require("../middleware/authenticate");
const emotions = require("../middleware/emotiondetector");
const { io } = require("../middleware/videocall");
const User = require("../models/userSchema");
const Call = require('../models/Call');
const Offer = require('../models/Offer');
const QuestionReponse = require('../models/QuestionReponse');
const multer = require('multer');
const Applicant = require("../models/Applicant");
const VideoRecord = require("../models/Video");
const CandidateData = require('../models/CandidateData');
const Interview = require('../models/Interview');
const path = require('path');
const { spawn } = require('child_process');
const AnalysedVideo = require("../models/Analysedvideo");

// Register route
router.post("/register", async (req, res) => {
    const { fname, lname, email, password, cpassword, userType, company, jobTitle, education, experience } = req.body;

    if (!fname || !lname || !email || !password || !cpassword || !userType) {
        return res.status(422).json({ error: "Fill in all the details" });
    }

    try {
        const preuser = await userdb.findOne({ email: email });

        if (preuser) {
            return res.status(422).json({ error: "This email already exists" });
        } else if (password !== cpassword) {
            return res.status(422).json({ error: "Password and Confirm Password do not match" });
        }

        let userData;
        if (userType === 'recruiter') {
            if (!company || !jobTitle) {
                return res.status(422).json({ error: "Fill in all the recruiter details" });
            }
            userData = { fname, lname, email, password, cpassword, userType, company, jobTitle };
        } else if (userType === 'candidate') {
            if (!education || !experience) {
                return res.status(422).json({ error: "Fill in all the candidate details" });
            }
            userData = { fname, lname, email, password, cpassword, userType, education, experience };
        } else {
            return res.status(422).json({ error: "Invalid user type" });
        }

        const finalUser = new userdb(userData);
        const storeData = await finalUser.save();

        res.status(201).json({ status: 201, storeData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "Please fill in all the details" });
    }

    try {
        const user = await userdb.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = await user.generateAuthToken();
        const { _id, userType } = user; // Ajouter le type d'utilisateur à la réponse

        res.status(200).json({ token, user: { _id, email, userType } }); // Ajouter email ici
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    res.clearCookie('usercookie');
    res.status(200).json({ message: "Logged out successfully" });
});

// Save emotions route
router.post('/api/save-emotions', emotions.saveEmotions);

// Socket.io for video call
io.on('connection', (socket) => {
    socket.emit('me', socket.id);

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });

    socket.on('calluser', async ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit('calluser', { signal: signalData, from, name });

        // Sauvegarde de l'appel dans la base de données
        const call = new Call({
            userToCall,
            signalData,
            from,
            name
        });
        await call.save();
    });

    socket.on('answercall', (data) => {
        io.to(data.to).emit('callaccepted', data.signal);
    });
});

// Route to initiate a call
router.post('/makeCall', async (req, res) => {
    const { email, signalData, from, name } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Sauvegarde de l'appel dans la base de données
        const call = new Call({
            userToCall: user._id,
            signalData,
            from,
            name
        });
        await call.save();

        // Envoi de l'appel à l'utilisateur trouvé
        io.to(user.socketId).emit('incomingCall', { signal: signalData, from, name });
        res.status(200).send('Call initiated successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
//partie offres
// Get all offers
router.get('/alloffers', async (req, res) => {
    try {
        const offers = await Offer.find();
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create an offer
router.post('/createoffer', async (req, res) => {
    const { title, description, salary, domain } = req.body;

    const offer = new Offer({
        title,
        description,
        salary,
        domain
    });

    try {
        const newOffer = await offer.save();
        res.status(201).json(newOffer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an offer
router.put('/api/offers/:id', async (req, res) => {
    const { title, description, salary, domain } = req.body;
    try {
        const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, { title, description, salary, domain }, { new: true });
        res.json(updatedOffer);
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

// Delete an offer
router.delete('/api/offers/:id', async (req, res) => {
    try {
        await Offer.findByIdAndDelete(req.params.id);
        res.send('Offer deleted successfully');
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});
// Get offers by category
router.get('/offers/:domain', async (req, res) => {
    const domain = req.params.domain;
    try {
        const offers = await Offer.find({ domain: domain });
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//partie question réponse 
// Get all questions
router.get('/questions', async (req, res) => {
    try {
        const questions = await QuestionReponse.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a question
router.post('/createquestion', async (req, res) => {
    const { question, reponse,category } = req.body;

    const newQuestion = new QuestionReponse({
        question,
        reponse,
        category
    });

    try {
        const createdQuestion = await newQuestion.save();
        res.status(201).json(createdQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a question
router.put('/api/question/:id', async (req, res) => {
    const { question, reponse,category } = req.body;
    try {
        const updatedQuestion = await QuestionReponse.findByIdAndUpdate(req.params.id, { question, reponse,category }, { new: true });
        res.json(updatedQuestion);
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

// Delete a question
router.delete('/api/question/:id', async (req, res) => {
    try {
        await QuestionReponse.findByIdAndDelete(req.params.id);
        res.send('Question deleted successfully');
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});
router.use(express.static("D:/platforme entretien/server/uploads"));

var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'D:/platforme entretien/server/uploads');
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
    storage: storage
});
//postuler dans un offre
router.post('/apply-for-job', upload.single('cv'), async (req, res) => {
    try {
        const { offerId } = req.body;
        const email = req.body.email; // Récupérez l'e-mail de l'utilisateur à partir de la requête

        const applicant = new Applicant({
            email, // Utilisez l'e-mail de l'utilisateur
            offerId,
            cv: 'http://127.0.0.1:8009/' + req.file.filename // Utilisez simplement le nom du fichier, pas l'URL complète
        });

        await applicant.save();

        res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).json({ error: "Server error" });
    }
});
//consulter quesions coté clients
router.get('/offer-questions/:offerId', async (req, res) => {
    const offerId = req.params.offerId; // Récupérez l'ID de l'offre depuis les paramètres de l'URL

    try {
        // Trouvez l'offre dans la base de données
        const offer = await Offer.findById(offerId);

        if (!offer) {
            return res.status(404).json({ error: "Offer not found" });
        }

        // Maintenant, trouvez les questions correspondant à cette offre
        const questions = await QuestionReponse.find({ category: offer.category }); // Suppose que la catégorie de l'offre correspond à la catégorie des questions

        res.json(questions); // Renvoyer les questions trouvées en réponse
    } catch (error) {
        console.error("Error retrieving questions for offer:", error);
        res.status(500).json({ error: "Server error" });
    }
});
//  récupérer les questions par catégorie
router.get('/questions/:category', async (req, res) => {
    const category = req.params.category;

    try {
        const questions = await QuestionReponse.find({ category });
        res.json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ error: "Server error" });
    }
});
//analyser video
router.post('/analyse', upload.single('video'), async (req, res) => {
    const videoPath = req.file.path;
    const candidateEmail = req.body.email;
    let extractedText = '';
    let responseSent = false;

    const pythonProcess = spawn('python', ['extract_audio_and_text.py', videoPath]);
    pythonProcess.stdout.on('data', async (data) => {
        extractedText += data.toString();
        console.log('Extracted Text:', extractedText);
    
        // Enregistrer les données dans la base de données directement après l'extraction du texte
        if (!responseSent && extractedText.includes('Texte extrait:')) { // Vérifier si le texte extrait est disponible
            try {
                const extractedTextIndex = extractedText.indexOf('Texte extrait:') + 'Texte extrait:'.length;
                const extractedTextContent = extractedText.substring(extractedTextIndex).trim();

                const candidateData = new CandidateData({
                    email: candidateEmail,
                    extractedText: extractedTextContent // Utiliser le texte extrait réel pour enregistrement
                });
                console.log('Candidate Data:', candidateData); // Logging candidateData
                await candidateData.save();
                res.status(200).json({ extracted_text: extractedTextContent });
                responseSent = true; // Mettre à jour pour éviter l'envoi multiple de la réponse
            } catch (error) {
                console.error('Error saving data:', error);
                if (!responseSent) {
                    res.status(500).send('Error saving data.');
                    responseSent = true; // Assurez-vous que la réponse est envoyée même en cas d'erreur
                }
            }
        }
    });
    

    pythonProcess.on('close', (code) => {
        if (code !== 0 && !responseSent) {
            console.error('Python process closed with non-zero exit code:', code);
            res.status(500).send('Error extracting text from audio');
            responseSent = true; // Mettre à jour pour éviter l'envoi multiple de la réponse
        }
    });
});
router.post('/analyze-and-save-text', async (req, res) => {
    try {
        const { recordedVideoUrl } = req.body;

        // Appel au script Python pour extraire le texte de la vidéo
        const pythonProcess = spawn('python', ['extract_audio_and_text.py', recordedVideoUrl]);

        pythonProcess.stdout.on('data', async (data) => {
            const extractedText = data.toString().trim();
            if (extractedText) {
                // Enregistrement du texte extrait dans la base de données
                // Ici, vous pouvez utiliser une bibliothèque comme Mongoose pour interagir avec MongoDB
                // Exemple fictif d'enregistrement dans MongoDB
                // await TextModel.create({ text: extractedText });

                console.log('Texte extrait:', extractedText);

                // Envoyer une réponse au client
                res.status(200).json({ extractedText });
            } else {
                console.log('Erreur: Impossible d\'extraire du texte de la vidéo.');
                res.status(400).json({ error: 'Failed to extract text from the video.' });
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Erreur de script Python: ${data}`);
            res.status(500).json({ error: 'Internal server error.' });
        });
    } catch (error) {
        console.error('Erreur:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Configuration du client Speech-to-Text
const speechClient = new SpeechClient();

// Endpoint pour extraire le texte de l'audio de la vidéo
router.post('/extract-text-from-video', upload.single('video'), async (req, res) => {
    try {
      // Vérifier si un fichier vidéo a été téléchargé
      if (!req.file) {
        return res.status(400).send('No video file uploaded');
      }
  
      // Récupérer l'URL Blob depuis le corps de la requête
      const { blobUrl } = req.body;
  
      // Convertir l'URL Blob en données audio
      const response = await fetch(blobUrl);
      const audioBuffer = await response.arrayBuffer();
  
      // Configuration de la requête de transcription
      const audio = {
        content: Buffer.from(audioBuffer).toString('base64'),
      };
      const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'fr-FR', // Langue du contenu audio
      };
      const request = {
        audio: audio,
        config: config,
      };
  
      // Effectuer la transcription de l'audio
      const [transcriptionResponse] = await speechClient.recognize(request);
      const transcription = transcriptionResponse.results.map(result => result.alternatives[0].transcript).join('\n');
  
      // Retourner la transcription de l'audio
      res.json({ text: transcription });
    } catch (error) {
      console.error('Error extracting text from video:', error);
      res.status(500).send('Error extracting text from video');
    }
  });
  
  const { exec } = require('child_process');
  router.post('/extract-text-from-all-videos', async (req, res) => {
    try {
        // Récupérer toutes les vidéos enregistrées de la base de données
        const videos = await VideoRecord.find();

        // Stocker les transcriptions de chaque vidéo
        const transcriptions = [];

        // Parcourir toutes les vidéos et exécuter le script Python pour extraire le texte de l'audio
        for (const video of videos) {
            // Vérifier si l'URL de la vidéo est définie
            if (!video.videoUrl) {
                console.error('URL de la vidéo non définie :', video);
                continue; // Passer à la prochaine vidéo
            }

            // Exécuter le script Python pour transcrire l'audio en texte
            exec(`python transcribe_audio.py ${video.videoUrl}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erreur d'exécution: ${error}`);
                    return;
                }
                console.log(`Transcription de l'audio : ${stdout}`);
                // Stocker la transcription dans un tableau
                transcriptions.push({ videoId: video.id, text: stdout.trim() });
            });
        }

        // Attendez que toutes les transcriptions soient complétées avant de renvoyer la réponse
        setTimeout(() => {
            // Retourner les transcriptions de toutes les vidéos
            res.json(transcriptions);
        }, 5000); // Attendez 5 secondes (ou ajustez selon votre besoin)

    } catch (error) {
        console.error('Erreur lors de l\'analyse des vidéos :', error);
        res.status(500).send('Erreur lors de l\'analyse des vidéos.');
    }
    
});



router.post('/analysevideo', async (req, res) => {
    try {
        const videos = await VideoRecord.find({});
        const extractedData = [];
        for (const video of videos) {
            const { _id, email, videoUrl } = video;

            // Afficher les informations de la vidéo
            console.log(`Vidéo ID: ${_id}, Email: ${email}, URL: ${videoUrl}`);

            // Exécuter l'extraction de texte directement
            const pythonProcess = spawn('python', ['extract_audio_and_text.py', videoUrl]);
            let extractedText = '';

            pythonProcess.stdout.on('data', (data) => {
                extractedText += data.toString();
            });

            pythonProcess.on('close', async (code) => {
                if (code === 0) {
                    const startIndex = extractedText.indexOf('Texte extrait:') + 'Texte extrait:'.length;
                    const extractedTextContent = extractedText.substring(startIndex).trim();
                    
                    // Stocker les données extraites dans le tableau
                    extractedData.push({
                        videoId: _id,
                        email,
                        videoUrl,
                        extractedText: extractedTextContent
                    });

                    // Afficher les données analysées
                    console.log('Données analysées :', {
                        videoId: _id,
                        email,
                        videoUrl,
                        extractedText: extractedTextContent
                    });

                    // Vérifier si toutes les vidéos ont été analysées
                    if (extractedData.length === videos.length) {
                        // Envoyer les données extraites au format JSON une fois toutes les vidéos analysées
                        res.status(200).json(extractedData);
                    }
                } else {
                    console.error('Erreur lors de l\'extraction du texte de la vidéo.');
                }
            });
        }
    } catch (error) {
        console.error('Erreur lors de l\'analyse des vidéos :', error);
        res.status(500).send('Erreur lors de l\'analyse des vidéos.');
    }
});


//make interview
router.post('/schedule', async (req, res) => {
    try {
      const { date, link } = req.body;
      const interview = new Interview({ date, link });
      await interview.save();
      res.status(201).json({ message: 'Interview scheduled successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to schedule interview' });
    }
  });
  router.get('/interviews', async (req, res) => {
    try {
      // Fetch all interviews from the database
      const interviews = await Interview.find();
      
      // Send the interviews as a response
      res.status(200).json(interviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch interviews' });
    }
  });
 // Route pour enregistrer la vidéo
 /*
router.post('/api/video-record', async (req, res) => {
    const { email, videoUrl } = req.body;
  
    try {
      const newRecord = new VideoRecord({
        email,
        videoUrl,
      });
      await newRecord.save();
      res.status(201).json({ message: 'Video record saved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });*/
 // Route pour enregistrer la vidéo
router.post('/api/video-record', upload.single('video'), async (req, res) => {
    const { email } = req.body;
    const videoUrl = req.file.path; // Récupérer le chemin du fichier vidéo enregistré
  
    try {
      // Créer une nouvelle instance du modèle VideoRecord
      const newRecord = new VideoRecord({
        email,
        videoUrl
      });
  
      // Enregistrer dans la base de données
      await newRecord.save();
  
      res.status(201).json({ message: 'Video record saved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
// Fonction pour extraire les données à partir d'un fichier (PDF ou image) en utilisant le script Python
function extractDataFromFile(fileType, filePath, outputDir) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['D:/platforme entretien/server/Analysecv/extract_data.py', fileType, filePath, outputDir]); // Ajouter outputDir comme argument

        let data = '';
        pythonProcess.stdout.on('data', (chunk) => {
            data += chunk.toString();
        });

        pythonProcess.stderr.on('data', (err) => {
            reject(err.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    // Convertir les données extraites de la chaîne JSON en objet JavaScript
                    const extractedData = JSON.parse(data);
                    resolve(extractedData);
                } catch (parseError) {
                    reject('Error parsing extracted data: ' + parseError.message);
                }
            } else {
                reject(`Python process exited with code ${code}`);
            }
        });
    });
}

// Route pour analyser tous les CV des candidats
router.get('/analyze-applicants', async (req, res) => {
    try {
        const applicants = await Applicant.find();
        const analysisResults = [];

        for (const applicant of applicants) {
            const fileType = applicant.cv.split('.').pop(); // Obtenir l'extension du fichier
            let extractedData = { extracted_text: {}, extracted_faces: [] }; // Initialiser les données extraites

            if (['pdf', 'png', 'jpg', 'jpeg'].includes(fileType)) { // Vérifier si le type de fichier est pris en charge
                const outputDir = path.join(__dirname, 'extracted_faces'); // Répertoire de sortie pour les fichiers extraits
                extractedData = await extractDataFromFile(fileType, applicant.cv, outputDir);
            }

            // Organiser les données extraites en sections
            const organizedData = {
                applicantId: applicant._id,
                extractedText: extractedData.extracted_text || {}, // Utiliser un objet vide par défaut
                extractedFacesLinks: extractedData.extracted_faces_links|| [] // Utiliser un tableau vide par défaut
            };

            analysisResults.push(organizedData);
        }
        res.status(200).json({ message: 'Applicants analyzed successfully', data: analysisResults });
    } catch (error) {
        console.error('Error analyzing applicants:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
//affichage applicant
router.get('/applicants', async (req, res) => {
    try {
      const applicants = await Applicant.find();
      res.json(applicants);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  

module.exports = router;