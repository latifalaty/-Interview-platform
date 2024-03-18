require("dotenv").config();
const express = require("express");
const app = express();
require("./db/conn");
const router = require("./routes/router");
const cors = require("cors");
const cookiParser = require("cookie-parser")
const port = 8009;


 app.get("/",(req,res)=>{
     res.status(201).json("server created")
});

app.use(express.json());
app.use(cookiParser());
app.use(cors());
app.use(router);

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

const meetings = {}; // Stockage des ID de réunion et des participants

// Gestion de la connexion du client
io.on('connection', (socket) => {
  console.log('a user connected');

  // Gestion de l'événement pour rejoindre une réunion
  socket.on('joinMeeting', (meetingId) => {
    socket.join(meetingId);
    if (!meetings[meetingId]) {
      meetings[meetingId] = [socket.id];
    } else {
      meetings[meetingId].push(socket.id);
    }
    console.log('user joined meeting:', meetingId);
  });

  // Gestion de la diffusion des messages vidéo et audio
  socket.on('stream', (data) => {
    socket.to(data.room).broadcast.emit('stream', data);
  });

  // Gestion de la déconnexion du client
  socket.on('disconnect', () => {
    console.log('user disconnected');
    Object.keys(meetings).forEach((meetingId) => {
      meetings[meetingId] = meetings[meetingId].filter((id) => id !== socket.id);
      if (meetings[meetingId].length === 0) {
        delete meetings[meetingId];
      }
    });
  });
});


app.listen(port,()=>{
    console.log(`server start at port no : ${port}`);
})