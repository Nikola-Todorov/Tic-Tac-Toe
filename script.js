var origBoard;
var huPlayer = 'X';
var aiPlayer = 'O';
var currentPlayer = huPlayer; 
var gameStarted = false;
var winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

var playerXWins = 0;
var playerOWins = 0;

var cells = document.querySelectorAll('.cell');
var modeSelection = document.querySelector('#mode-selection');
var startButton = document.querySelector('button');

startButton.addEventListener('click', function () {
  var selectedMode = document.querySelector('input[name="game-mode"]:checked').value;
  startGame(selectedMode);
});

function startGame(selectedMode) {
  document.querySelector('.endgame').style.display = 'none';
  origBoard = Array.from(Array(9).keys());
  for (var i = 0; i < cells.length; i++) {
    cells[i].innerText = '';
    cells[i].style.removeProperty('background-color');
    cells[i].addEventListener('click', function (e) {
      turnClick(e.target);
    });
  }
  if (selectedMode === 'human') {
    currentPlayer = huPlayer;
    document.getElementById('player-x-wins').style.display = 'block';
    document.getElementById('player-o-wins').style.display = 'block';
  } else if (selectedMode === 'ai') {
    currentPlayer = huPlayer;
    if (currentPlayer === aiPlayer) {
      turn(bestSpot(), aiPlayer);
      currentPlayer = huPlayer;
    }
    document.getElementById('player-x-wins').style.display = ''; //win counter da ne se pokazuva koga se igra protiv AI
    document.getElementById('player-o-wins').style.display = '';
  }

  displayCurrentPlayerTurn();
}


function displayCurrentPlayerTurn() {
  var turnInfo = document.querySelector('#turn-info');
  var gameMode = document.querySelector('input[name="game-mode"]:checked').value;
  
  if (origBoard.some(cell => cell === 'X') && gameMode === 'human') {
    turnInfo.innerText = "Current Turn: " + (currentPlayer === huPlayer ? "Player X" : "Player O");
  } else {
    turnInfo.innerText = ""; 
  }
}

function turnClick(square) {
  if (document.querySelector('.endgame').style.display === 'block') {
    return;
  }
  if (typeof origBoard[square.id] == 'number') {
    turn(square.id, currentPlayer);
    currentPlayer = currentPlayer === huPlayer ? aiPlayer : huPlayer;
    displayCurrentPlayerTurn();

    if (currentPlayer === aiPlayer && document.querySelector('input[name="game-mode"]:checked').value === 'ai') {
      setTimeout(function () {
        turn(bestSpot(), aiPlayer);
        currentPlayer = huPlayer;
        displayCurrentPlayerTurn();
      }, 500); 
    }
  }
  checkTie();
}

function updatePlayerWins() {
  document.getElementById('player-x-wins').innerText = 'Player X Wins: ' + playerXWins;
  document.getElementById('player-o-wins').innerText = 'Player O Wins: ' + playerOWins;
}

function turn(squareId, player) {
  origBoard[squareId] = player;
  document.getElementById(squareId).innerText = player;
  if (player === 'X') {
    document.getElementById('xSound').play();
  } else {
    document.getElementById('oSound').play();
  }
  let gameWon = checkWin(origBoard, player);
  if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
  let plays = board.reduce((a, e, i) => (e === player ? a.concat(i) : a), []);
  let gameWon = null;
  for (let [index, win] of winCombos.entries()) {
    if (win.every((elem) => plays.indexOf(elem) > -1)) {
      gameWon = { index: index, player: player };
      break;
    }
  }
  return gameWon;
}

function gameOver(gameWon) {
  for (let index of winCombos[gameWon.index]) {
    document.getElementById(index).style.backgroundColor = gameWon.player === huPlayer ? 'blue' : 'red';
  }
  for (var i = 0; i < cells.length; i++) {
    cells[i].removeEventListener('click', function () {});
  }
  if (gameWon.player === huPlayer) {
    declareWinner('Player X wins');
    playerXWins++; 
    updatePlayerWins(); 
    document.getElementById('winSound').play(); 
  } else if (gameWon.player === aiPlayer) {
    declareWinner('Player O wins');
    playerOWins++; 
    updatePlayerWins(); 
    document.getElementById('winSound').play(); 
  } else {
    if (!checkTie()) {
      declareWinner('Tie Game');
    }
  }
}

function declareWinner(who) {
  document.querySelector('.endgame').style.display = 'block';
  document.querySelector('.endgame .text').innerText = who;
}

function emptySquares() {
  return origBoard.filter((s) => typeof s == 'number');
}

function bestSpot() {
  return minimax(origBoard, aiPlayer).index;
}

function checkTie() {
  if (emptySquares().length === 0 && !checkWin(origBoard, huPlayer) && !checkWin(origBoard, aiPlayer)) {
    for (var i = 0; i < cells.length; i++) {
      cells[i].style.backgroundColor = 'green';
      cells[i].removeEventListener('click', function () {});
    }
    declareWinner('Tie Game');
    document.getElementById('tieSound').play(); 
    return true;
  }
  return false;
}

function minimax(newBoard, player) {
  var availSpots = emptySquares(newBoard);
  if (checkWin(newBoard, player)) {
    return { score: -10 };
  } else if (checkWin(newBoard, aiPlayer)) {
    return { score: 20 };
  } else if (availSpots.length === 0) {
    return { score: 0 };
  }

  var moves = [];
  for (var i = 0; i < availSpots.length; i++) {
    var move = {};
    move.index = newBoard[availSpots[i]];
    newBoard[availSpots[i]] = player;
    if (player == aiPlayer) {
      var result = minimax(newBoard, huPlayer);
      move.score = result.score;
    } else {
      var result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }
    newBoard[availSpots[i]] = move.index;
    moves.push(move);
  }

  var bestMove;
  if (player === aiPlayer) {
    var bestScore = -10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    var bestScore = 10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}

startGame('human'); 
var restartButton = document.querySelector('.restartt'); 
restartButton.addEventListener('click', function () {
  playRestartAudio();
  var selectedMode = document.querySelector('input[name="game-mode"]:checked').value;
  startGame(selectedMode);
});
function playRestartAudio() {
var restartSound = new Audio('click_button.mp3'); 
restartSound.play();
}
