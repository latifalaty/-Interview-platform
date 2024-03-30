const express = require("express");
const router = express.Router();
const userdb = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const emotions = require("../middleware/emotiondetector");
const { io } = require("../middleware/videocall");
const User = require("../models/userSchema");
const Call = require('../models/Call');
const Offer = require('../models/Offer');
const QuestionReponse = require('../models/QuestionReponse');
const multer = require('multer');
const Applicant = require("../models/Applicant");
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
    const { title, description, salary, category } = req.body;

    const offer = new Offer({
        title,
        description,
        salary,
        category
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
    const { title, description, salary, category } = req.body;
    try {
        const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, { title, description, salary, category }, { new: true });
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
router.get('/offers/:category', async (req, res) => {
    const category = req.params.category;
    try {
        const offers = await Offer.find({ category: category });
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
router.use(express.static("uploads/"));

var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads/');
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
    storage: storage
});
router.post('/apply-for-job', upload.single('cv'), async (req, res) => {
    try {
        const { offerId } = req.body;
        const email = req.body.email; // Récupérez l'e-mail de l'utilisateur à partir de la requête

        const applicant = new Applicant({
            email, // Utilisez l'e-mail de l'utilisateur
            offerId,
            cv: req.file.filename // Utilisez simplement le nom du fichier, pas l'URL complète
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

router.post('/analyse', upload.single('video'), (req, res) => {
    const videoPath = req.file.path;
    let extractedText = ''; // Buffer pour stocker le texte extrait
    let responseSent = false; // Variable de contrôle pour s'assurer que la réponse n'est envoyée qu'une seule fois
  
    const pythonProcess = spawn('python', ['extract_audio_and_text.py', videoPath]);
  
    pythonProcess.stdout.on('data', (data) => {
      extractedText += data.toString(); // Ajoute les données à la variable
    });
  
    pythonProcess.stderr.on('data', (data) => {
      console.error('Error:', data.toString());
      if (!responseSent) {
        res.status(500).send('Error extracting text from audio');
        responseSent = true; // Met à jour la variable de contrôle
      }
    });
  
    pythonProcess.on('close', () => {
      console.log('Extracted Text:', extractedText);
      if (!responseSent) {
        res.send(extractedText); // Envoie la réponse une seule fois
        responseSent = true; // Met à jour la variable de contrôle
      }
    });
  });
  
  
  


  

module.exports = router;
