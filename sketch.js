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

// Get the bounding box of the background image
function getBackgroundBounds() {
    if (!bgImage) return { x: 0, y: 0, width: width, height: height };
    
    // Scale to fit canvas height, align to top-left
    let scale = height / bgImage.height;
    let drawWidth = bgImage.width * scale;
    let drawHeight = height;
    
    return {
        x: 0,
        y: 0,
        width: drawWidth,
        height: drawHeight
    };
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

// Paths the words will take in the mineshaft. 
// x and y are ratios of the background image (between 0 and 1) 
const PATHS = [
    // Top mineshaft path
    
    [
        { x: 0.2, y: 0.16 },
        { x: 0.4, y: 0.16 },
        { x: 0.45, y: 0.18 },
        { x: 0.56, y: 0.18 },
        { x: 0.65, y: 0.27 },
        { x: 0.8, y: 0.27 },
        { x: 0.86, y: 0.35 },
        { x: 0.9, y: 0.35 }
    ],
    // Second top mineshaft
    [
        { x: 0.13, y: 0.3 },
        { x: 0.28, y: 0.3 },
        { x: 0.32, y: 0.44 },
        { x: 0.37, y: 0.44 },
        { x: 0.43, y: 0.5 },
        { x: 0.65, y: 0.5 }
    ],

    // Second top mineshaft: Bounce off wall and join second lowest mineshaft
    [
        { x: 0.13, y: 0.3 },
        { x: 0.28, y: 0.3 },
        { x: 0.32, y: 0.44 },
        { x: 0.37, y: 0.44 },
        { x: 0.43, y: 0.5 },
        { x: 0.9, y: 0.5 },
        { x: 0.43, y: 0.5 },
        { x: 0.37, y: 0.44 },
        { x: 0.17, y: 0.44 },
        { x: 0.14, y: 0.58 },
        { x: 0.1, y: 0.58 },

        
    ],
    
    // Second lowest mineshaft: Disapear behind gold box
    [
        { x: 0.1, y: 0.58 },
        { x: 0.34, y: 0.58 },
        { x: 0.43, y: 0.69 },
        { x: 0.52, y: 0.69 },
        { x: 0.57, y: 0.66 },
        { x: 0.8, y: 0.66 },
    ],

    // Lowest mineshaft path
    [
        { x: 0.12, y: 0.77 },
        { x: 0.17, y: 0.77 },
        { x: 0.25, y: 0.86 },
        { x: 0.75, y: 0.86}
    ]

];

class Word {
    constructor(text) {
        this.text = text;
        
        // Randomly select one of the paths
        this.pathIndex = floor(random(PATHS.length));
        this.path = PATHS[this.pathIndex];
        
        // Convert proportional coordinates to actual pixel positions
        // based on background image bounds. Makes it so that the paths are consistent across screens
        let bgBounds = getBackgroundBounds();
        this.waypoints = this.path.map(wp => ({
            x: bgBounds.x + (wp.x * bgBounds.width),
            y: bgBounds.y + (wp.y * bgBounds.height)
        }));
        
        // Calculate total path length
        this.totalPathLength = this.calculatePathLength();
        
        // Track distance traveled along the path
        this.distanceTraveled = 0;
        
        // Start at the first waypoint
        this.currentWaypointIndex = 0;
        this.pos = createVector(
            this.waypoints[0].x,
            this.waypoints[0].y
        );
        
        // Movement speed (pixels per frame)
        this.speed = 1.5;
        
        // Proportion of the path to fade in and out (5%)
        this.fadeInDistance = 0.05;  
        this.fadeOutDistance = 0.05;
    }
    
    calculatePathLength() {
        let totalLength = 0;
        for (let i = 0; i < this.waypoints.length - 1; i++) {
            let p1 = this.waypoints[i];
            let p2 = this.waypoints[i + 1];
            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            totalLength += Math.sqrt(dx * dx + dy * dy);
        }
        return totalLength;
    }

    update() {
        // Check if we've reached the end of the path
        if (this.currentWaypointIndex >= this.waypoints.length - 1) {
            // Finished the path
            return;
        }
        
        // Get current target waypoint
        let target = this.waypoints[this.currentWaypointIndex + 1];
        let targetVec = createVector(target.x, target.y);
        
        // Calculate direction to target
        let direction = p5.Vector.sub(targetVec, this.pos);
        let distance = direction.mag();
        
        // If we're close enough to the target, move to next waypoint
        if (distance < this.speed) {
            this.distanceTraveled += distance;
            this.pos.set(target.x, target.y);
            this.currentWaypointIndex++;
        } else {
            // Move towards the target
            direction.normalize();
            direction.mult(this.speed);
            this.pos.add(direction);
            this.distanceTraveled += this.speed;
        }
    }
    
    calculateOpacity() {
        // Calculate progress along the path (0 to 1)
        let progress = this.distanceTraveled / this.totalPathLength;
        
        let opacity = 255;
        
        // Fade in at the start
        if (progress < this.fadeInDistance) {
            opacity = map(progress, 0, this.fadeInDistance, 0, 255);
        }
        // Fade out at the end
        else if (progress > (1 - this.fadeOutDistance)) {
            opacity = map(progress, 1 - this.fadeOutDistance, 1, 255, 0);
        }
        
        return constrain(opacity, 0, 255);
    }

    display() {
        let opacity = this.calculateOpacity();
        fill(100, 150, 255, opacity);
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = color(100, 150, 255, opacity);
        text(this.text, this.pos.x, this.pos.y);
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'rgba(0,0,0,0)';
    }

    isFinished() {
        // Finished when we've reached the last waypoint and faded out
        return this.currentWaypointIndex >= this.waypoints.length - 1 && 
               this.calculateOpacity() <= 0;
    }
    
    // Update waypoint positions when window is resized
    updateWaypoints() {
        let bgBounds = getBackgroundBounds();
        this.waypoints = this.path.map(wp => ({
            x: bgBounds.x + (wp.x * bgBounds.width),
            y: bgBounds.y + (wp.y * bgBounds.height)
        }));
        // Recalculate path length with new dimensions
        this.totalPathLength = this.calculatePathLength();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (inputField && submitButton) {
        inputField.position(width / 2 - 150, height - 50);
        submitButton.position(inputField.x + inputField.width + 10, height - 50);
    }
    
    // Update waypoints for all existing echoes
    for (let echo of echoes) {
        echo.updateWaypoints();
    }
}