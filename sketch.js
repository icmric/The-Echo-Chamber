let socket;
let echoes = [];
let inputField;
let submitButton;
let caveShapes = [];
const NUM_CAVE_SHAPES = 30;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Connect to the server
    socket = io();
    
    // Listen for 'newEcho' messages from the server
    socket.on('newEcho', (data) => {
        console.log('Received a new echo from the server:', data.text);
        echoes.push(new Word(data.text));
    });

    // UI Setup
    inputField = createInput('');
    inputField.position(width / 2 - 150, height - 50);
    inputField.size(220);

    submitButton = createButton('Echo');
    submitButton.position(inputField.x + inputField.width + 10, height - 50);
    submitButton.mousePressed(sendEcho);

    // Initial Canvas Settings
    textAlign(CENTER, CENTER);
    textSize(32);

    generateCaveShapes();
}

function draw() {
    background(10, 10, 20);
    noStroke();
    fill(30, 30, 45);
    for (let shape of caveShapes) {
        ellipse(shape.x, shape.y, shape.radius * 1.5, shape.radius);
    }
    fill(10, 10, 20, 150);
    rect(0, 0, width, height);

    for (let i = echoes.length - 1; i >= 0; i--) {
        let echo = echoes[i];
        echo.update();
        echo.display();
        if (echo.isFinished()) {
            echoes.splice(i, 1);
        }
    }
}

function keyPressed() {
    if (keyCode === ENTER) {
        sendEcho();
    }
}

function sendEcho() {
    const text = inputField.value();
    if (text !== "") {
        socket.emit('newEcho', { text: text });
        inputField.value('');
    }
}

function generateCaveShapes() {
    caveShapes = [];
    for (let i = 0; i < NUM_CAVE_SHAPES; i++) {
        caveShapes.push({
            x: random(width),
            y: random(height),
            radius: random(10, 80) * random(0.5, 1.5)
        });
    }
}

class Word {
    constructor(text) {
        this.text = text;
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(random(-0.3, 0.3), random(-0.2, 0.2));
        this.lifespan = 255;
    }

    update() {
        this.pos.add(this.vel);
        this.lifespan -= 0.7;
    }

    display() {
        fill(100, 150, 255, this.lifespan);
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = color(100, 150, 255, this.lifespan);
        text(this.text, this.pos.x, this.pos.y);
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'rgba(0,0,0,0)';
    }

    isFinished() {
        return this.lifespan < 0;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    inputField.position(width / 2 - 150, height - 50);
    submitButton.position(inputField.x + inputField.width + 10, height - 50);
    generateCaveShapes();
}