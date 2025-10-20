// sketch.js
// This is the frontend p5.js code that runs in the browser.

let socket;
let strokeColor;

function setup() {
  const canvas = createCanvas(800, 600);
  // Put the canvas inside the 'canvas-container' div
  canvas.parent('canvas-container');
  background(255);

  // Generate a random color for this user's stroke
  strokeColor = color(random(255), random(255), random(255));
  
  // Connect to the server.
  // The server is serving this file, so we can just connect to the host.
  socket = io.connect();

  // Set up a listener for 'drawing' messages from the server
  socket.on('drawing', (data) => {
    // When we receive data, draw a line on the canvas
    stroke(data.color.r, data.color.g, data.color.b);
    strokeWeight(4);
    line(data.x, data.y, data.px, data.py);
  });
}

// This function is called repeatedly by p5.js, but we don't need it for this example.
function draw() {
  // Nothing needed here for this simple example.
}

// This function is called by p5.js whenever the mouse is dragged.
function mouseDragged() {
  // 1. Draw on the local canvas immediately for a responsive feel
  stroke(strokeColor);
  strokeWeight(4);
  line(mouseX, mouseY, pmouseX, pmouseY);
  
  // 2. Prepare the data object to send to the server
  const data = {
    x: mouseX,
    y: mouseY,
    px: pmouseX,
    py: pmouseY,
    color: {
        r: red(strokeColor),
        g: green(strokeColor),
        b: blue(strokeColor)
    }
  };
  
  // 3. Send the data to the server in a message called 'drawing'
  socket.emit('drawing', data);
}
