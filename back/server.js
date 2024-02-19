const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Route pour la détection des émotions
app.get('/api/emotion-detection', (req, res) => {
  const pythonProcess = spawn('python', ['C:/Users/user/Entretien-app/ia/emotion_detection_script.py']);

  let responseData = ''; // Initialize variable to store response data

  pythonProcess.stdout.on('data', (data) => {
    responseData += data.toString(); // Append data to responseData
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error('Erreur du script Python:', data.toString());
    res.status(500).json({ error: 'Erreur interne du serveur' });
  });

  pythonProcess.on('close', (code) => {
    try {
      const emotions = JSON.parse(responseData); // Parse the accumulated data
      res.json({ emotions });
    } catch (error) {
      console.error('Erreur lors de l\'analyse JSON des données:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  });
});

// Routes supplémentaires (non fournies dans votre code)
// ...

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
