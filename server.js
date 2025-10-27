// This server will relay 'echo' messages to all connected clients.
import { Filter } from 'bad-words';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

const filter = new Filter();
filter.addWords("badword");

// This line tells Express to make all files in the current folder
// available to the browser.
app.use(express.static(__dirname));

// This function runs whenever a new user opens the webpage.
io.on('connection', (socket) => {
  console.log(`A user connected with ID: ${socket.id}`);
  
  // Listen for a 'newEcho' message from any client
  socket.on('newEcho', (data) => {
    const cleanText = filter.clean(data.text);
    if (cleanText === data.text) {
      // When a message is received, log it to the server console
    console.log(`Received echo: "${data.text}"`);
    

    // Broadcast the received data to EVERYONE connected
    io.emit('newEcho', data);
    } else {
      console.log(`Filtered inappropriate message from user ${socket.id}`);
    }
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

