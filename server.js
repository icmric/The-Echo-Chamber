// server.js
// This server will relay 'echo' messages to all connected clients.

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

// This line tells Express to make all files in the current folder
// available to the browser.
app.use(express.static(__dirname));

// This function runs whenever a new user opens the webpage.
io.on('connection', (socket) => {
  console.log(`A user connected with ID: ${socket.id}`);
  
  // Listen for a 'newEcho' message from any client
  socket.on('newEcho', (data) => {
    // When a message is received, log it to the server console
    console.log(`Received echo: "${data.text}"`);
    
    // Broadcast the received data to EVERYONE connected
    io.emit('newEcho', data);
  });

  // This function runs when that user closes the page.
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running!`);
  console.log(`Open your browser to http://localhost:${PORT}`);
});

