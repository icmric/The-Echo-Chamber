let socket;
let echoes = [];
let inputField;
let submitButton;
let speechRec;
let speechActive = false;
let speak;

// Images
let micOnImg;
let micOffImg;
let bgImage;

function preload() {
    // Load images
    bgImage = loadImage('assets/background.png');
    micOnImg = loadImage('assets/mic-on.jpg');
    micOffImg = loadImage('assets/mic-off.jpg');
}

async function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Initialize speech recognition
    speechRec = new p5.SpeechRec('en-US', gotSpeech);
    speechRec.start(true, false);
    speechActive = true;
    speak = new p5.Speech()

    
    // Connect to the server
    socket = io();
    
    // Listen for 'newEcho' messages from the server
    socket.on('newEcho', (data) => {
        echoes.push(new Word(data.text));
        speak.setVoice("Microsoft Catherine - English (Australia)");
        applyEchoAndSpeak(data.text);
    });

    // UI Setup
    inputField = createInput('');
    inputField.position(width / 2 - 150, height - 50);
    inputField.size(220);    submitButton = createButton('Echo');
    submitButton.position(inputField.x + inputField.width + 10, height - 50);
    submitButton.mousePressed(sendEcho); 

    // Initial Canvas Settings
    textAlign(CENTER, CENTER);
    textSize(32);
}

// Speech recognized event  
function gotSpeech() {
    if (speechRec.resultValue) {
        let said = speechRec.resultString;
        if (said && said.trim() !== "") {
            socket.emit('newEcho', { text: said });
        }
    }
}

function applyEchoAndSpeak(text) {
    // Original speech at normal rate and pitch
    speak.setRate(1.0);
    speak.setPitch(1.0);
    speak.setVolume(1.0);
    speak.speak(text);
    
    // Echo 1: slightly delayed, slightly higher pitch, quieter
    setTimeout(() => {
        speak.setRate(1.1);
        speak.setPitch(1.1);
        speak.setVolume(0.75);
        speak.speak(text);
    }, 800);
    
    // Echo 2: more delayed, higher pitch, even quieter
    setTimeout(() => {
        speak.setRate(1.2);
        speak.setPitch(1.2);
        speak.setVolume(0.5);
        speak.speak(text);
    }, 1600);
    
    // Echo 3: very delayed, highest pitch, very quiet
    setTimeout(() => {
        speak.setRate(1.3);
        speak.setPitch(1.3);
        speak.setVolume(0.3);
        speak.speak(text);
    }, 2400);
}

function draw() {
    // Draw background - aligned to top-left, scaled to fit height
    drawBackground();

    for (let i = echoes.length - 1; i >= 0; i--) {
        let echo = echoes[i];
        echo.update();
        echo.display();
        if (echo.isFinished()) {
            echoes.splice(i, 1);
        }
    }

    // Draw microphone button image in bottom right
    if (micOnImg && micOffImg) {
        if (speechActive) {
            image(micOnImg, width - 70, height - 70, 60, 60);
        } else {
            image(micOffImg, width - 70, height - 70, 60, 60);
        }
    }
}

function drawBackground() {
    if (!bgImage) return;
    
    // Scale to fit canvas height, align to top-left
    let scale = height / bgImage.height;
    let drawWidth = bgImage.width * scale;
    let drawHeight = height;
    
    image(bgImage, 0, 0, drawWidth, drawHeight);
}

function toggleMicrophone() {
    if (speechActive) {
        // Stop speech recognition
        speechRec.rec.stop();
        speechActive = false;
    } else {
        // Start speech recognition
        speechRec.start(true, false);
        speechActive = true;
    }
}

function mousePressed() {
    // Handle clicks on the microphone image
    if (mouseX >= width - 70 && mouseX <= width - 10 && 
        mouseY >= height - 70 && mouseY <= height - 10) {
        toggleMicrophone();
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
        inputField.value('');    }
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
    if (inputField && submitButton) {
        inputField.position(width / 2 - 150, height - 50);
        submitButton.position(inputField.x + inputField.width + 10, height - 50);
    }
}