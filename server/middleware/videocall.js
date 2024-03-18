const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        method: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

module.exports = { app, server, io };
