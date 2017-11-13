const express               = require('express');
const app                   = express();
const server                = require('http').Server(app);
const io                    = require('socket.io')(server);
const mongoose              = require('mongoose');

const Chat                  = require('./Chat.js');

// .env process file requirement
require('dotenv').config();

users = [];
connections = [];

// Connect to mongo database
mongoose.connect(process.env.DATABASE, { useMongoClient: true });
const db = mongoose.connection;
db.on("open", function(ref) {
    console.log("Connected to mongo server.");

    app.get('/chat', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });
    
    var chat = io
    .of('/chat')
    .on('connection', (socket) => {
        // Handle connect
        connections.push(socket);
        console.log('Connected: %s socket/s connected', connections.length);
    
        // Handle disconnect
        socket.on('disconnect', (data) => {
            users.splice(users.indexOf(socket.username), 1);
            connections.splice(connections.indexOf(socket), 1);
            console.log('Disconnected: %s socket/s connected', connections.length);
        });
    
        // Get chats from mongodb
        Chat.find().limit(100).then((messages) => {
            // Emit chats to output
            chat.emit('output', messages);
        });
    
        // Handle message input event
        socket.on('send message', (data) => {
            const message = data;
            // Message not blank condition
            if (message !== "") {
                // Create model
                const newMessage = new Chat({
                    username: socket.username,
                    message: message,
                    time: returnDateTime()
                });
                // Save model
                newMessage.save();
                // Emit message
                chat.emit('output', [newMessage]);
            }
        });
        
        // Add and update users
        socket.on('new user', (data, callback) => {
            callback(true);
            socket.username = data;
            users.push(socket.username);
            updateUsernames();
        });
    
        function updateUsernames() {
            // Emit users
            chat.emit('get users', users);
        }
    
        function returnDateTime() {
            let date = new Date();
            let hours = date.getHours();
            let mins = date.getMinutes().toString();
            let month = date.getMonth();
            let day = date.getDate();
            let year = date.getFullYear();
            let time = "";
            if (mins.length === 1) {
                mins = "0" + mins;
            }
            if (hours >= 13) {
                hours = hours - 12;
                time = `${month}/${day}/${year} at ${hours}:${mins} PM`;
            } else if (hours === 0) {
                hours = 12;
                time = `${month}/${day}/${year} at ${hours}:${mins} AM`;
            } else {
                time = `${month}/${day}/${year} at ${hours}:${mins} AM`;
            }
            return time;
        }
    })
});
db.on("error", function(err) {
    console.log("Could not connect to mongo server.");
    console.error(err);
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Application running on ${process.env.PORT || 3000}...`);
});

    
