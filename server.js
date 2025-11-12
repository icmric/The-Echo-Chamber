// All of the server management was done with heavy help from GenAI since its beyond scope of this subject. Implementation of bad-words was done entiryley by me though.
// Generally though, it sets up a HTTP server on port 3000 and opens a websocket connection with each client

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

// Create the bad words filter
const filter = new Filter();
// Add a custom word to the filter so the filter can be demonstrated (although this does come pre filled so swear words are also filtered)
filter.addWords("badword");

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  socket.on('newEcho', (data) => {
    // When a new echo is received, run it through the filter. If no changes are made it is clean and can be sent out
    // If changes are made, something has been filtered out so it gets ignored and a note is made in the server console.
    const cleanText = filter.clean(data.text);
    if (cleanText === data.text) {
      // When a message is received, log it to the server console
      console.log(`Received echo: "${data.text}"`);
    
      // send the echo to everyone connected to the server
      io.emit('newEcho', data);
    } else {
      // Log that an inappropriate message was filtered out
      console.log(`Filtered inappropriate message from user ${socket.id}`);
    }
  });
});

// When the server has started, log this and the URL to access it
server.listen(PORT, () => {
  console.log(`Server is running!`);
  console.log(`Open your browser to http://localhost:${PORT}`);
});

