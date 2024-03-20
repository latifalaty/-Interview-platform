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


app.listen(port,()=>{
    console.log(`server start at port no : ${port}`);
})