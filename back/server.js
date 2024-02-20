const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

//  reconnassance facial
app.get('/api/emotion-detection', (req, res) => {
  const pythonProcess = spawn('python', ['C:/Users/user/Entretien-app/ia/emotion_detection_script.py']);

  let responseData = ''; // Initialize variable to store response data
  let errorOccured = false;

  pythonProcess.stderr.on('data', (data) => {
    console.error('Erreur du script Python:', data.toString());
    errorOccured = true;
  });

  pythonProcess.stdout.on('data', (data) => {
    responseData += data.toString(); 
  });

  pythonProcess.on('close', (code) => {
    if (errorOccured) {
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      try {
        const emotionData = JSON.parse(responseData); 
        res.json(emotionData); 
      } catch (error) {
        console.error('Erreur lors de l\'analyse JSON des données:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
