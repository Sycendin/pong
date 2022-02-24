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
const winning = document.createElement("div");

// Audio
const audioWin = document.querySelector(".audioWin");
const audioLose = document.querySelector(".audioLose");

// Color
const color = document.createElement("input");
const ballColorSelect = document.createElement("input");
color.value = "26AB9D";
ballColorSelect.value = "FFFFFF";
// winning
const winningSelect = document.createElement("input");
// Paddle
const paddleHeight = 10;
let paddleWidth = 50;
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
let ballColor = "#FFFFFF";

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
let winningScore = 1;
let isGameOver = true;
let isNewGame = true;
let select = true;
let backToStart = false;

// Dificulty
let difficulty = "normal";

// Render Everything on Canvas
const renderCanvas = () => {
  difficulty === "easy"
    ? (paddleWidth = 70)
    : difficulty === "normal"
    ? (paddleWidth = 50)
    : difficulty === "hard"
    ? (paddleWidth = 30)
    : null;
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
  contextPong.fillStyle = ballColor;
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
        // speedY -= 1;
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
        // speedY += 1;

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
  body.removeChild(winning);
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
  title.textContent = `${winner} Won!`;
  // // Button
  const playAgainBtn = document.createElement("button");
  playAgainBtn.setAttribute("onclick", `startGame()`);
  playAgainBtn.textContent = "Play Again";
  playAgainBtn.classList.add("difficulty-btns");
  const startMenuBtn = document.createElement("button");
  startMenuBtn.setAttribute("onclick", `startMenu()`);
  startMenuBtn.textContent = "Start Menu";
  startMenuBtn.classList.add("difficulty-btns");
  const btnDiv = document.createElement("div");
  btnDiv.classList.add("game-over-btns");
  // // Append
  gameOverEl.appendChild(title);
  btnDiv.appendChild(playAgainBtn);
  btnDiv.appendChild(startMenuBtn);
  gameOverEl.appendChild(btnDiv);
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
  if (body.contains(startScreen)) {
    body.removeChild(startScreen);
    canvasPong.hidden = false;
  }
  winning.textContent = "";
  winning.width = width;
  winning.height = 206;
  winning.classList.add("winning-div");

  const text = document.createElement("h1");
  text.textContent = `Score ${winningScore} To Win`;
  text.style.color = "white";
  winning.appendChild(text);
  body.appendChild(winning);
  // paddleColor = pColor;
  // contextPong.fillStyle = paddleColor;
  removeConfetti();
  // After showGameEl is run
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
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

const colorSet = () => {
  paddleColor = `#${color.value}`;
  ballColor = `#${ballColorSelect.value}`;
  if (!isNaN(winningSelect.value)) {
    winningScore = parseInt(winningSelect.value);
  }
};
// Sets the difficulty setting based on button selected
const dificultySetting = (setting) => {
  if (setting === "easy") {
    difficulty = "easy";
  } else if (setting === "normal") {
    difficulty = "normal";
  } else {
    difficulty = "hard";
  }
};
// On Load render startmenu to pick colors
const startMenu = () => {
  canvasPong.hidden = true;

  // Clear startscreen
  startScreen.textContent = "";
  startScreen.classList.add("game-over-container");
  const text = document.createElement("h1");
  text.textContent = "Select Paddle Color";

  // // Container
  gameOverEl.textContent = "";
  gameOverEl.classList.add("game-over-container");

  // Set paddle color
  color.classList.add("jscolor");

  color.id = "paddle-color";
  color.setAttribute(
    "onchange",
    `colorSet('${window.getComputedStyle(color).backgroundColor}')`
  );

  // small space
  const smallSpace = document.createElement("div");
  smallSpace.classList.add("small-space");

  // Set ball color
  const ballColorText = document.createElement("h1");
  ballColorText.textContent = "Select Ball Color Color";
  ballColorSelect.classList.add("jscolor");
  ballColorSelect.id = "paddle-color";
  // // Button
  ballColorSelect.setAttribute(
    "onchange",
    `colorSet('${window.getComputedStyle(ballColorSelect).backgroundColor}')`
  );

  const winningSelectText = document.createElement("h1");
  winningSelectText.textContent = "Select Winning score";
  winningSelect.classList.add("text-input");
  winningSelect.setAttribute("onchange", `colorSet('${winningSelect.value}')`);

  const difficultyText = document.createElement("h1");
  difficultyText.textContent = "Select Difficulty";

  const buttonDiv = document.createElement("div");
  buttonDiv.classList.add("game-over-btns");

  const easybutton = document.createElement("button");
  easybutton.setAttribute("onclick", `dificultySetting('easy')`);
  easybutton.textContent = "Easy";
  easybutton.classList.add("difficulty-btns");

  const normalButton = document.createElement("button");
  normalButton.setAttribute("onclick", `dificultySetting('normal')`);
  normalButton.textContent = "Normal";
  normalButton.classList.add("difficulty-btns");

  const hardButton = document.createElement("button");
  hardButton.setAttribute("onclick", `dificultySetting('hard')`);
  hardButton.textContent = "Hard";
  hardButton.classList.add("difficulty-btns");
  // Large space
  const space = document.createElement("div");
  space.classList.add("space");
  // Button
  const startButton = document.createElement("button");
  startButton.setAttribute("onclick", `startGame()`);
  startButton.textContent = "Start Game";
  // Append
  startScreen.appendChild(text);
  startScreen.append(color);

  startScreen.appendChild(ballColorText);
  startScreen.append(ballColorSelect);

  startScreen.append(winningSelectText);
  startScreen.append(winningSelect);

  startScreen.append(difficultyText);
  buttonDiv.append(easybutton);
  buttonDiv.append(normalButton);
  buttonDiv.append(hardButton);
  startScreen.append(buttonDiv);

  startScreen.append(space);

  startScreen.append(startButton);

  body.appendChild(startScreen);
  particles = [];
};
// On load, display startMenu
startMenu();
