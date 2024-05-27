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
const CvAnalysis = require('D:/platforme entretien/server/models/CvAnalysis');
const emotionSchema = require('D:/platforme entretien/server/models/emotionSchema');
const path = require('path');
const { spawn } = require('child_process');
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
    const { question, reponse,domain } = req.body;

    const newQuestion = new QuestionReponse({
        question,
        reponse,
        domain
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
    const { question, reponse,domain } = req.body;
    try {
        const updatedQuestion = await QuestionReponse.findByIdAndUpdate(req.params.id, { question, reponse,domain }, { new: true });
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
router.use(express.static("./uploads"));

var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './uploads');
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
router.post('/analyse', async (req, res) => {
    try {
        // Recherche de la dernière vidéo créée
        const video = await VideoRecord.findOne({}).sort({ createdAt: -1 });

        if (!video) {
            return res.status(404).json({ error: 'Aucune vidéo trouvée.' });
        }

        const { _id, email, videoUrl } = video;
        console.log(`Vidéo ID: ${_id}, Email: ${email}, URL: ${videoUrl}`);

        const pythonProcess = spawn('python', ['extract_audio_and_text.py', videoUrl]);

        let extractedText = '';

        const processFinished = new Promise((resolve, reject) => {
            pythonProcess.stdout.on('data', async (data) => {
                const message = data.toString();
                console.log('Message from Python:', message);

                if (message.includes('{"extracted_text":')) {
                    try {
                        const jsonString = message.substring(message.indexOf('{"extracted_text":'));
                        const result = JSON.parse(jsonString);
                        extractedText = result.extracted_text;

                        const candidateData = new CandidateData({
                            email: email,
                            extractedText: extractedText,
                        });
                        await candidateData.save();
                        console.log('Données du candidat enregistrées avec succès.');
                    } catch (error) {
                        console.error('Erreur lors de l\'analyse du JSON ou de l\'enregistrement des données:', error);
                    }
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error('Erreur dans le processus Python:', data.toString());
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('Le processus Python s\'est terminé avec un code de sortie non nul:', code);
                    reject(new Error(`Le processus Python s'est terminé avec le code ${code}`));
                } else {
                    resolve();
                }
            });
        });

        await processFinished;

        res.status(200).json({ message: 'Traitement vidéo terminé.', extractedText: extractedText });
    } catch (error) {
        console.error('Erreur lors du traitement des vidéos:', error);
        res.status(500).json({ error: 'Erreur lors du traitement des vidéos.' });
    }
});
// Récupérer les données d'émotions
router.get('/emotionanalyse', async (req, res) => {
    try {
      const data = await emotionSchema.find({});
      const emotionPercentagesByEmail = {};
  
      // Traitement des données d'émotions
      data.forEach(entry => {
        const email = entry.email;
        const emotions = entry.emotions;
  
        if (email && emotions) {
          if (!emotionPercentagesByEmail[email]) {
            emotionPercentagesByEmail[email] = {};
          }
  
          emotions.forEach(emotionObj => {
            const emotion = emotionObj.emotion;
            const percentage = emotionObj.percentage;
  
            if (!emotionPercentagesByEmail[email][emotion]) {
              emotionPercentagesByEmail[email][emotion] = 0;
            }
  
            emotionPercentagesByEmail[email][emotion] += percentage;
          });
        }
      });
  
      // Format de réponse
      const responseData = Object.entries(emotionPercentagesByEmail).map(([email, percentages]) => ({
        email: email,
        mainEmotions: Object.entries(percentages)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([emotion, percentage]) => ({ emotion, percentage })),
        otherEmotions: Object.entries(percentages)
          .sort((a, b) => b[1] - a[1])
          .slice(2, 6)
          .map(([emotion, percentage]) => ({ emotion, percentage }))
      }));
  
      res.json(responseData);
    } catch (err) {
      console.error('Erreur lors de la récupération des données d\'émotions :', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });


// Créer une entrevue
router.post('/schedule', async (req, res) => {
    try {
        const { email, date, link, domain, roomnumber } = req.body; // Ajout de l'e-mail du candidat et du numéro de salle
        const interview = new Interview({ email, date, link, domain, roomnumber }); // Création de l'objet d'entrevue avec l'e-mail, le domaine et le numéro de salle
        await interview.save(); // Enregistrement de l'entrevue dans la base de données
        res.status(201).json({ message: 'Interview scheduled successfully', interview });
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
  router.post('/api/video-record', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier vidéo n\'a été téléchargé' });
        }

        const { email } = req.body;
        const videoUrl ='http://127.0.0.1:8009/' + req.file.filename ; // Récupérer le chemin du fichier vidéo enregistré
        
        // Créer une nouvelle instance du modèle VideoRecord
        const newRecord = new VideoRecord({
            email,
            videoUrl
        });

        // Enregistrer dans la base de données
        await newRecord.save();

        res.status(201).json({ message: 'Enregistrement vidéo réussi' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la vidéo:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement de la vidéo' });
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
router.post('/analyze-applicants', async (req, res) => {
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
                email: applicant.email,
                extractedText: extractedData.extracted_text || {}, // Utiliser un objet vide par défaut
                extractedFacesLinks: extractedData.extracted_faces_links || [] // Utiliser un tableau vide par défaut
            };

            // Enregistrer les données analysées dans la base de données
            const cvAnalysis = new CvAnalysis(organizedData);
            await cvAnalysis.save();

            analysisResults.push(organizedData);
        }
        res.status(200).json({ message: 'Applicants analyzed successfully', data: analysisResults });
    } catch (error) {
        console.error('Error analyzing applicants:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /applicants - Retrieve all applicants with offer domains
router.get('/applicants', async (req, res) => {
    try {
      // Fetch all applicants and populate the offerId with only the domain field
      const applicants = await Applicant.find().populate('offerId', 'domain');
      
      // Send the retrieved applicants as a JSON response
      res.json(applicants);
    } catch (err) {
      // Log the error for debugging purposes
      console.error('Error fetching applicants:', err);
  
      // Send a 500 Internal Server Error status with the error message
      res.status(500).json({ message: 'Server error: Unable to fetch applicants' });
    }
  });
  
//afficher les videos recordé
  router.get('/videos', async (req, res) => {
    try {
        const videos = await VideoRecord.find({});
        res.status(200).json({ videos });
    } catch (error) {
        console.error('Erreur lors de la récupération des vidéos depuis la base de données:', error);
        res.status(500).json({ error: "Erreur lors de la récupération des vidéos depuis la base de données." });
    }
});
// Route pour récupérer les données d'analyse des CV
router.get('/cvAnalysis', async (req, res) => {
    try {
        const cvAnalysisData = await CvAnalysis.find();
        res.json(cvAnalysisData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour récupérer les données des candidats analysées
router.get('/candidateData', async (req, res) => {
    try {
        const candidateData = await CandidateData.find();
        res.json(candidateData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});
// Route pour récupérer les données d'émotion
router.get('/emotion', async (req, res) => {
    try {
        const emotionData = await emotionSchema.find();
        res.json(emotionData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});
//affichage des offres :
router.get('/offers', async (req, res) => {
    try {
        const offers = await Offer.find();
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Route pour récupérer les questions du domaine en fonction de l'email
router.get('/question', async (req, res) => {
    try {
        const email="latylaty712@gmail.com"
        console.log(`Fetching interview for email: ${email}`);

        // Recherche de l'interview correspondant à l'email
        const interview = await Interview.findOne({ email });

        if (!interview) {
            console.log("Interview not found for email:", email);
            return res.status(404).json({ message: "Interview not found" });
        }

        console.log(`Interview found: ${JSON.stringify(interview)}`);

        // Recherche des questions correspondant au domaine de l'interview
        const questions = await QuestionReponse.find({ domain: interview.domain });

        console.log(`Questions found: ${JSON.stringify(questions)}`);

        res.json(questions);
    } catch (error) {
        console.error("Error fetching domain questions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//infoanalyser pour chaque candidat
router.get('/data-by-email', async (req, res) => {
    try {
        // Fetch all candidate data
        const candidateDataList = await CandidateData.find();
        // Fetch all CV analysis data
        const cvAnalysisList = await CvAnalysis.find();

        // Create a map to store information by email
        const dataByEmail = {};

        // Populate dataByEmail with candidate data
        candidateDataList.forEach(candidate => {
            if (!dataByEmail[candidate.email]) {
                dataByEmail[candidate.email] = {};
            }
            dataByEmail[candidate.email].candidateData = candidate;
        });

        // Populate dataByEmail with CV analysis data
        cvAnalysisList.forEach(cvAnalysis => {
            if (!dataByEmail[cvAnalysis.email]) {
                dataByEmail[cvAnalysis.email] = {};
            }
            dataByEmail[cvAnalysis.email].cvAnalysis = cvAnalysis;
        });

        // Send the aggregated data as JSON response
        res.json(dataByEmail);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
});
//classificcation finale 
router.post('/analyze-data', async (req, res) => {
    try {
        // Récupérer les données d'analyse de CV depuis la base de données
        const cvData = await CvAnalysis.find({}, 'email extractedText');
        
        // Récupérer les données d'analyse de la vidéo du candidat depuis la base de données
        const videoData = await CandidateData.find({}, 'email extractedText');

        // Concaténer les deux ensembles de données
        const combinedData = [...cvData, ...videoData];

        // Exécuter le script Python avec spawn
        const pythonProcess = spawn('python', ['Classifiervideocv.py']);

        // Gérer les sorties du processus Python
        pythonProcess.stdout.on('data', (data) => {
            console.log('Résultats du script Python :', data.toString());
            res.json({ results: data.toString() }); // Envoyer les résultats au client
        });

        // Gérer les erreurs de processus Python
        pythonProcess.stderr.on('data', (data) => {
            console.error('Erreur lors de l\'exécution du script Python :', data.toString());
            res.status(500).json({ error: 'Erreur lors de l\'exécution du script Python' });
        });

        // Envoyer les données au script Python
        pythonProcess.stdin.write(JSON.stringify(combinedData));
        pythonProcess.stdin.end();
    } catch (err) {
        console.error('Erreur lors de la récupération des données d\'analyse :', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des données d\'analyse' });
    }
});
module.exports = router;