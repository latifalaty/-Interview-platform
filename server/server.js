const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/"captureDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define MongoDB schema and model
const mediaSchema = new mongoose.Schema({
  mediaUrl: String,
});

const Media = mongoose.model("video", mediaSchema);

// Middleware
app.use(bodyParser.json());

// API endpoint to save media URL
app.post("/api/media", async (req, res) => {
  try {
    const { mediaUrl } = req.body;
    const newMedia = new Media({ mediaUrl });
    await newMedia.save();
    res.status(201).json({ message: "Media URL saved successfully" });
  } catch (error) {
    console.error("Error saving media URL:", error);
    res.status(500).json({ message: "Failed to save media URL" });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
