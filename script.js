// Canvas
const { body } = document;
const canvasPong = document.createElement("canvas");
canvasPong.classList.add("canvas-pong");
const contextPong = canvasPong.getContext("2d");

const width = 500;
const height = 700;
const screenWidth = body.clientWidth;
const canvasPosition = screenWidth / 2 - width / 2;
const isMobile = window.matchMedia("(max-width: 600px)");
const gameOverEl = document.createElement("div");
const startScreen = document.createElement("div");

// Audio
const audioWin = document.querySelector(".audioWin");
const audioLose = document.querySelector(".audioLose");

// Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;
let paddleColor = "#26AB9D";

// Ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

// Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// Change Mobile Settings
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 3;
}

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 2;
let isGameOver = true;
let isNewGame = true;
let select = true;

// Render Everything on Canvas
const renderCanvas = () => {
  // console.log(paddleColor);
  // Canvas Background
  contextPong.fillStyle = "black";
  contextPong.fillRect(0, 0, width, height);

  // Paddle Color
  contextPong.fillStyle = paddleColor;

  // Player Paddle (Bottom)
  contextPong.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);

  // Computer Paddle (Top)
  contextPong.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  contextPong.beginPath();
  contextPong.setLineDash([4]);
  contextPong.moveTo(0, 350);
  contextPong.lineTo(500, 350);
  contextPong.strokeStyle = "grey";
  contextPong.stroke();

  // Ball
  contextPong.beginPath();
  contextPong.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  contextPong.fillStyle = "white";
  contextPong.fill();

  // Score
  contextPong.font = "32px Courier New";
  contextPong.fillText(playerScore, 20, canvasPong.height / 2 + 50);
  contextPong.fillText(computerScore, 20, canvasPong.height / 2 - 30);
};

// Create Canvas Element
const createCanvas = () => {
  canvasPong.width = width;
  canvasPong.height = height;
  body.appendChild(canvasPong);
  renderCanvas();
};

// Reset Ball to Center
const ballReset = () => {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
};

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += -speedY;
  // Horizontal Speed
  if (playerMoved && paddleContact) {
    ballX += speedX;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
const ballBoundaries = () => {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;
      // Add Speed on Hit
      if (playerMoved) {
        speedY -= 1;
        // Max Speed
        if (speedY < -5) {
          speedY = -5;
          computerSpeed = 6;
        }
      }
      speedY = -speedY;
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      // Reset Ball, add to Computer Score
      ballReset();
      computerScore++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      // Reset Ball, add to Player Score
      ballReset();
      playerScore++;
    }
  }
};

// Computer Movement
const computerAI = () => {
  if (playerMoved) {
    if (paddleTopX + paddleDiff < ballX) {
      paddleTopX += computerSpeed;
    } else {
      paddleTopX -= computerSpeed;
    }
  }
};

const showGameOverEl = (winner) => {
  // Play victory audio if player wins
  // otherwise play losing sound
  if (winner === "Player") {
    audioWin.play();
    startConfetti();
  } else if (winner === "Computer") {
    audioLose.play();
  }
  // Hide Canvas
  canvasPong.hidden = true;
  // // Container
  gameOverEl.textContent = "";
  gameOverEl.classList.add("game-over-container");
  // // Title
  const title = document.createElement("h1");
  title.textContent = `${winner} Wins!`;
  // // Button
  const playAgainBtn = document.createElement("button");
  playAgainBtn.setAttribute("onclick", `startGame()`);
  playAgainBtn.textContent = "Play Again";
  // // Append
  gameOverEl.appendChild(title);
  gameOverEl.appendChild(playAgainBtn);
  body.appendChild(gameOverEl);
  playerMoved = false;
};

// Check If One Player Has Winning Score, If They Do, End Game
const gameOver = () => {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    // Set Winner
    let winner = playerScore === winningScore ? "Player" : "Computer";
    showGameOverEl(winner);
  }
};

// Called Every Frame
const animate = () => {
  renderCanvas();
  // Move ball only when player paddle moves
  if (playerMoved == true) {
    ballMove();
  }
  // When the ball makes contact with paddle or walls, bounce off
  // and change directions
  // Also tracks if ball passes bottom or top of the container
  ballBoundaries();
  computerAI();
  gameOver();
  if (!isGameOver) {
    window.requestAnimationFrame(animate);
  }
};

// Start Game, Reset Everything
const startGame = () => {
  // paddleColor = pColor;
  // contextPong.fillStyle = paddleColor;
  removeConfetti();
  // After showGameEl is run
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
    canvasPong.hidden = false;
  } else if (select) {
    body.removeChild(startScreen);
    canvasPong.hidden = false;
  }
  select = false;
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();
  createCanvas();
  animate();
  canvasPong.addEventListener("mousemove", (e) => {
    playerMoved = true;
    // Compensate for canvas being centered
    paddleBottomX = e.clientX - canvasPosition - paddleDiff;
    if (paddleBottomX < paddleDiff) {
      paddleBottomX = 0;
    }
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = width - paddleWidth;
    }
    // Hide Cursor
    canvasPong.style.cursor = "none";
  });
};

const colorset = () => {
  paddleColor = `#${color.value}`;
};
// On Load

canvasPong.hidden = true;
startScreen.textContent = "";
startScreen.classList.add("game-over-container");
const text = document.createElement("h1");
text.textContent = "Select Paddle Color";
// // Container
gameOverEl.textContent = "";
gameOverEl.classList.add("game-over-container");
// // Title
// const title = document.createElement("h1");
// title.textContent = `Choose color`;
const color = document.createElement("input");
color.classList.add("jscolor");
color.value = "26AB9D";
color.id = "paddle-color";
// // Button
const startButton = document.createElement("button");
color.setAttribute(
  "onchange",
  `colorset('${window.getComputedStyle(color).backgroundColor}')`
);
startButton.setAttribute("onclick", `startGame()`);
startButton.textContent = "Start Game";
const space = document.createElement("div");
space.classList.add("space");

// // Append
startScreen.appendChild(text);
startScreen.append(color);
startScreen.append(space);
startScreen.append(startButton);
// gameOverEl.appendChild(playAgainBtn);
body.appendChild(startScreen);

// startGame();
