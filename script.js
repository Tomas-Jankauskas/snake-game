// Initialize canvas and context
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game variables
let speed = 7;
let tileCount = 20;
let tileSize = canvas.width / tileCount;
let headX = 10;
let headY = 10;

// Snake parts array (for the tail)
const snakeParts = [];
let tailLength = 2;

// Food position
let foodX = 5;
let foodY = 5;

// Velocities
let xVelocity = 0;
let yVelocity = 0;

// Scores
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;

// Game state
let gameStarted = false;
let gamePaused = false;
let gameOver = false;

// Update high score display initially
document.getElementById('high-score').textContent = highScore;

// Game loop
function drawGame() {
    if (!gameStarted || gamePaused) return;
    
    changeSnakePosition();
    
    // Check for game over
    if (isGameOver()) {
        displayGameOver();
        return;
    }
    
    clearScreen();
    checkFoodCollision();
    drawFood();
    drawSnake();
    drawScore();
    
    // Speed up the game as score increases
    let gameSpeed = speed + Math.floor(score / 10);
    if (gameSpeed > 15) gameSpeed = 15; // Cap the max speed
    
    setTimeout(drawGame, 1000 / gameSpeed);
}

function isGameOver() {
    // Game over conditions
    if (yVelocity === 0 && xVelocity === 0) {
        return false;
    }
    
    // Walls
    if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
        return true;
    }
    
    // Self collision
    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];
        if (part.x === headX && part.y === headY) {
            return true;
        }
    }
    
    return false;
}

function displayGameOver() {
    gameOver = true;
    gameStarted = false;
    
    // Game Over text
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.fillText('Game Over!', canvas.width / 6, canvas.height / 2);
    
    document.getElementById('start-btn').textContent = 'Play Again';
}

function clearScreen() {
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    // Draw snake parts
    ctx.fillStyle = '#059862';
    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];
        ctx.fillRect(part.x * tileSize, part.y * tileSize, tileSize, tileSize);
    }
    
    // Add new snake part at current position
    snakeParts.push({x: headX, y: headY});
    if (snakeParts.length > tailLength) {
        // Remove the furthest item from the snake parts if we have more than our tail length
        snakeParts.shift();
    }
    
    // Draw snake head
    ctx.fillStyle = '#0c7d45';
    ctx.fillRect(headX * tileSize, headY * tileSize, tileSize, tileSize);
}

function changeSnakePosition() {
    headX = headX + xVelocity;
    headY = headY + yVelocity;
}

function drawFood() {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(foodX * tileSize, foodY * tileSize, tileSize, tileSize);
}

function checkFoodCollision() {
    if (foodX === headX && foodY === headY) {
        // Move food to a new random position
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);
        
        // Ensure food doesn't spawn on the snake
        let foodOnSnake = true;
        while (foodOnSnake) {
            foodOnSnake = false;
            for (let i = 0; i < snakeParts.length; i++) {
                if (snakeParts[i].x === foodX && snakeParts[i].y === foodY) {
                    foodOnSnake = true;
                    foodX = Math.floor(Math.random() * tileCount);
                    foodY = Math.floor(Math.random() * tileCount);
                    break;
                }
            }
        }
        
        // Increase tail length
        tailLength++;
        
        // Update score
        score++;
        document.getElementById('score').textContent = score;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById('high-score').textContent = highScore;
        }
    }
}

function drawScore() {
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

function resetGame() {
    // Reset variables
    headX = 10;
    headY = 10;
    xVelocity = 0;
    yVelocity = 0;
    tailLength = 2;
    score = 0;
    document.getElementById('score').textContent = score;
    snakeParts.length = 0;
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    gameOver = false;
    
    // Clear screen
    clearScreen();
    drawSnake();
    drawFood();
}

function startGame() {
    if (gameOver || !gameStarted) {
        resetGame();
        gameStarted = true;
        document.getElementById('start-btn').textContent = 'Restart';
        drawGame();
    } else {
        resetGame();
    }
}

// Event listeners
document.getElementById('start-btn').addEventListener('click', startGame);

// Key press event
document.body.addEventListener('keydown', keyDown);

function keyDown(event) {
    if (!gameStarted) {
        startGame();
    }
    
    // Up
    if (event.keyCode == 38 || event.keyCode == 87) {
        // Prevent moving if already moving in opposite direction
        if (yVelocity == 1) return;
        yVelocity = -1;
        xVelocity = 0;
    }
    
    // Down
    if (event.keyCode == 40 || event.keyCode == 83) {
        if (yVelocity == -1) return;
        yVelocity = 1;
        xVelocity = 0;
    }
    
    // Left
    if (event.keyCode == 37 || event.keyCode == 65) {
        if (xVelocity == 1) return;
        yVelocity = 0;
        xVelocity = -1;
    }
    
    // Right
    if (event.keyCode == 39 || event.keyCode == 68) {
        if (xVelocity == -1) return;
        yVelocity = 0;
        xVelocity = 1;
    }
}

// Touch controls for mobile
document.getElementById('up-btn').addEventListener('click', function() {
    if (!gameStarted) {
        startGame();
    }
    if (yVelocity == 1) return;
    yVelocity = -1;
    xVelocity = 0;
});

document.getElementById('down-btn').addEventListener('click', function() {
    if (!gameStarted) {
        startGame();
    }
    if (yVelocity == -1) return;
    yVelocity = 1;
    xVelocity = 0;
});

document.getElementById('left-btn').addEventListener('click', function() {
    if (!gameStarted) {
        startGame();
    }
    if (xVelocity == 1) return;
    yVelocity = 0;
    xVelocity = -1;
});

document.getElementById('right-btn').addEventListener('click', function() {
    if (!gameStarted) {
        startGame();
    }
    if (xVelocity == -1) return;
    yVelocity = 0;
    xVelocity = 1;
});

// Initial draw on page load
resetGame();