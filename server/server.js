const express = require('express');
const app = express();
const http = require('http');
const {Server}= require('socket.io');


const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


const PORT= process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ message:"SyncSpace Server is running"});
});

io.on('connection', (socket) => {
    console.log('User connected',socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected',socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
