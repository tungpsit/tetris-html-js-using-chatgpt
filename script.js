// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const SCORE_ELEMENT = document.getElementById("score-value");

// Game variables
let board = [];
let score = 0;
let gameRunning = false;
let currentPiece = null;
let currentPieceRow = 0;
let currentPieceCol = 0;
let moveDownInterval = null;

// Tetris shapes
const shapes = [
  // Square
  [
    [1, 1],
    [1, 1],
  ],

  // Line
  [[1, 1, 1, 1]],

  // T-shape
  [
    [0, 1, 0],
    [1, 1, 1],
  ],

  // L-shape
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],

  // Reverse L-shape
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ],

  // Z-shape
  [
    [1, 1, 0],
    [0, 1, 1],
  ],

  // Reverse Z-shape
  [
    [0, 1, 1],
    [1, 1, 0],
  ],

  // Add more shapes as needed...
];

// Initialize game board
function initializeBoard() {
  for (let row = 0; row < BOARD_HEIGHT; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_WIDTH; col++) {
      board[row][col] = "";
    }
  }
}

// Generate a new random Tetris piece
function generatePiece() {
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  const piece = [];
  for (let row = 0; row < randomShape.length; row++) {
    piece[row] = [];
    for (let col = 0; col < randomShape[row].length; col++) {
      piece[row][col] = randomShape[row][col] === 1 ? "piece" : "";
    }
  }
  return piece;
}

// Move the current piece left
function moveLeft() {
  if (gameRunning && canMove(currentPiece, currentPieceRow, currentPieceCol - 1)) {
    currentPieceCol--;
    render();
  }
}

// Move the current piece right
function moveRight() {
  if (gameRunning && canMove(currentPiece, currentPieceRow, currentPieceCol + 1)) {
    currentPieceCol++;
    render();
  }
}

// Move the current piece down
function moveDown() {
  if (gameRunning && canMove(currentPiece, currentPieceRow + 1, currentPieceCol)) {
    currentPieceRow++;
    render();
  } else {
    lockPiece();
    removeCompletedRows();
    currentPiece = generatePiece();
    currentPieceRow = 0;
    currentPieceCol = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece[0].length / 2);
    if (!canMove(currentPiece, currentPieceRow, currentPieceCol)) {
      endGame();
    }
  }
}

// Rotate the current piece
function rotate() {
  if (!gameRunning) return;

  const rotatedPiece = [];
  const numRows = currentPiece.length;
  const numCols = currentPiece[0].length;

  for (let col = 0; col < numCols; col++) {
    rotatedPiece[col] = [];
    for (let row = 0; row < numRows; row++) {
      rotatedPiece[col][row] = currentPiece[numRows - row - 1][col];
    }
  }

  if (canMove(rotatedPiece, currentPieceRow, currentPieceCol)) {
    currentPiece = rotatedPiece;
    render();
  }
}

// Check if a piece can move to the specified position
function canMove(piece, row, col) {
  for (let i = 0; i < piece.length; i++) {
    for (let j = 0; j < piece[i].length; j++) {
      if (piece[i][j] !== "" && (row + i >= BOARD_HEIGHT || col + j < 0 || col + j >= BOARD_WIDTH || board[row + i][col + j] !== "")) {
        return false;
      }
    }
  }
  return true;
}

// Lock the current piece in place on the game board
function lockPiece() {
  for (let i = 0; i < currentPiece.length; i++) {
    for (let j = 0; j < currentPiece[i].length; j++) {
      if (currentPiece[i][j] !== "") {
        board[currentPieceRow + i][currentPieceCol + j] = currentPiece[i][j];
      }
    }
  }
}

// Remove completed rows from the game board
function removeCompletedRows() {
  let rowsToRemove = [];

  for (let row = 0; row < BOARD_HEIGHT; row++) {
    if (board[row].every((cell) => cell !== "")) {
      rowsToRemove.push(row);
    }
  }

  if (rowsToRemove.length === 0) return;

  for (let row of rowsToRemove) {
    board.splice(row, 1);
    board.unshift(Array(BOARD_WIDTH).fill(""));
  }

  score += rowsToRemove.length;
  SCORE_ELEMENT.innerText = score;
}

// End the game
function endGame() {
  gameRunning = false;
  if (moveDownInterval) {
    clearInterval(moveDownInterval);
  }
  alert("Game Over");
}

// Render the game board
function render() {
  const gameBoardElement = document.getElementById("game-board");
  gameBoardElement.innerHTML = "";

  // Render the game board cells
  for (let row = 0; row < BOARD_HEIGHT; row++) {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      const cell = document.createElement("div");
      cell.className = board[row][col] ? "filled-cell" : "empty-cell";
      gameBoardElement.appendChild(cell);
    }
  }

  // Render the current piece
  for (let row = 0; row < currentPiece.length; row++) {
    for (let col = 0; col < currentPiece[row].length; col++) {
      if (currentPiece[row][col]) {
        const cell = document.createElement("div");
        cell.className = "piece-cell";
        cell.style.top = (currentPieceRow + row) * 30 + "px";
        cell.style.left = (currentPieceCol + col) * 30 + "px";
        gameBoardElement.appendChild(cell);
      }
    }
  }
}

// Start the game
function startGame() {
  if (gameRunning) return;

  initializeBoard();
  score = 0;
  gameRunning = true;
  SCORE_ELEMENT.innerText = score;
  currentPiece = generatePiece();
  currentPieceRow = 0;
  currentPieceCol = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece[0].length / 2);

  render();

  moveDownInterval = setInterval(moveDown, 1000);
}

// Event listeners for key presses
document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      moveLeft();
      break;
    case "ArrowRight":
      moveRight();
      break;
    case "ArrowDown":
      moveDown();
      break;
    case "ArrowUp":
      rotate();
      break;
  }
});

// Event listener for start button click
document.getElementById("start-button").addEventListener("click", startGame);
