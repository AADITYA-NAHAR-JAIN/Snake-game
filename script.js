// Game variables
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let gameLoop;

// Snake appearance variables
let lastDirection = 'right';
let directionChangeCooldown = 0;

window.onload = function() {
  canvas = document.getElementById('gameCanvas');
  canvas.width = 400;
  canvas.height = 400;
  ctx = canvas.getContext('2d');

  document.getElementById('score').textContent = score;
  document.getElementById('highScore').textContent = highScore;
  document.getElementById('level').textContent = level;

  // Event listeners for buttons
  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('pauseBtn').addEventListener('click', pauseGame);
  document.getElementById('resetBtn').addEventListener('click', resetGame);
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    closeGameOverModal();
    resetGame();
    startGame();
  });

  // Keyboard controls
window.addEventListener('keydown', function(e) {
  // Prevent arrow keys from scrolling the page
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) > -1) {
    e.preventDefault();
  }
  handleKeyDown(e);
});

  // Mobile controls
  const directionButtons = document.querySelectorAll('.direction-btn');
  directionButtons.forEach(button => {
    button.addEventListener('click', () => {
      changeDirection(button.getAttribute('data-direction'));
    });
  });

  resetGame();
};

function startGame() {
  if (!gameRunning) {
    gameRunning = true;
    gamePaused = false;
    // Slower speed - increased interval time
    gameLoop = setInterval(gameTick, 200 - (level - 1) * 5);
  }
}

function pauseGame() {
  if (gameRunning) {
    if (!gamePaused) {
      clearInterval(gameLoop);
      gamePaused = true;
    } else {
      gameLoop = setInterval(gameTick, 200 - (level - 1) * 5);
      gamePaused = false;
    }
  }
}

function resetGame() {
  clearInterval(gameLoop);
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = 'right';
  lastDirection = 'right';
  score = 0;
  level = 1;
  gameRunning = false;
  gamePaused = false;
  directionChangeCooldown = 0;
  placeFood();
  updateScore();
  draw();
}

function gameTick() {
  if (!gameRunning || gamePaused) return;

  if (directionChangeCooldown > 0) {
    directionChangeCooldown--;
  }

  const head = { ...snake[0] };

  switch (direction) {
    case 'right':
      head.x++;
      break;
    case 'left':
      head.x--;
      break;
    case 'up':
      head.y--;
      break;
    case 'down':
      head.y++;
      break;
  }

  if (checkCollision(head)) {
    gameOver();
    return;
  }

  snake.unshift(head);
  lastDirection = direction;

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (score % 50 === 0) {
      level++;
      clearInterval(gameLoop);
      // Slower speed progression
      gameLoop = setInterval(gameTick, Math.max(150, 200 - (level - 1) * 5));
    }
    placeFood();
  } else {
    snake.pop();
  }

  updateScore();
  draw();
}

function checkCollision(position) {
  if (
    position.x < 0 ||
    position.x >= canvas.width / 20 ||
    position.y < 0 ||
    position.y >= canvas.height / 20
  ) {
    return true;
  }

  for (let i = 0; i < snake.length; i++) {
    if (position.x === snake[i].x && position.y === snake[i].y) {
      return true;
    }
  }

  return false;
}

function placeFood() {
  food.x = Math.floor(Math.random() * (canvas.width / 20));
  food.y = Math.floor(Math.random() * (canvas.height / 20));

  for (let i = 0; i < snake.length; i++) {
    if (food.x === snake[i].x && food.y === snake[i].y) {
      placeFood();
      break;
    }
  }
}

function updateScore() {
  document.getElementById('score').textContent = score;
  document.getElementById('highScore').textContent = highScore;
  document.getElementById('level').textContent = level;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines
  drawGrid();

  // Draw realistic snake
  drawRealisticSnake();

  // Draw realistic food
  drawRealisticFood();
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawRealisticSnake() {
  // Create snake body with realistic appearance
  snake.forEach((segment, index) => {
    const x = segment.x * 20;
    const y = segment.y * 20;
    
    if (index === 0) {
      // Snake head with realistic features
      drawSnakeHead(x, y);
    } else {
      // Snake body segments
      drawSnakeBody(x, y, index);
    }
  });
}

function drawSnakeHead(x, y) {
  // Head base
  ctx.fillStyle = '#00D9FF';
  ctx.shadowColor = '#00D9FF';
  ctx.shadowBlur = 15;
  ctx.fillRect(x, y, 20, 20);
  
  // Head gradient
  const headGradient = ctx.createRadialGradient(x + 10, y + 10, 0, x + 10, y + 10, 10);
  headGradient.addColorStop(0, '#FFFFFF');
  headGradient.addColorStop(0.3, '#00D9FF');
  headGradient.addColorStop(1, '#0066CC');
  ctx.fillStyle = headGradient;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(x, y, 20, 20);
  ctx.globalAlpha = 1;
  
  // Eyes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + 5, y + 5, 2, 0, Math.PI * 2);
  ctx.arc(x + 15, y + 5, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye shine
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + 6, y + 4, 1, 0, Math.PI * 2);
  ctx.arc(x + 16, y + 4, 1, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = '#00FF88';
  ctx.beginPath();
  if (direction === 'right') ctx.arc(x + 18, y + 10, 2, 0, Math.PI * 2);
  else if (direction === 'left') ctx.arc(x + 2, y + 10, 2, 0, Math.PI * 2);
  else if (direction === 'up') ctx.arc(x + 10, y + 2, 2, 0, Math.PI * 2);
  else if (direction === 'down') ctx.arc(x + 10, y + 18, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnakeBody(x, y, index) {
  // Body segment with scale pattern
  const alpha = 1 - (index * 0.1);
  const bodyGradient = ctx.createRadialGradient(x + 10, y + 10, 0, x + 10, y + 10, 10);
  bodyGradient.addColorStop(0, '#00FF88');
  bodyGradient.addColorStop(1, '#008844');
  
  ctx.fillStyle = bodyGradient;
  ctx.globalAlpha = alpha;
  ctx.shadowColor = '#00FF88';
  ctx.shadowBlur = 8;
  ctx.fillRect(x, y, 20, 20);
  
  // Scale pattern
  ctx.fillStyle = '#00AA66';
  ctx.globalAlpha = alpha * 0.5;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.arc(x + 3 + i * 6, y + 3 + j * 6, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawRealisticFood() {
  // Create food with realistic appearance
  ctx.shadowColor = '#FF0088';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#FF0088';
  ctx.beginPath();
  ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Food highlight
  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(food.x * 20 + 12, food.y * 20 + 8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Reset shadow
  ctx.shadowBlur = 0;
}

function handleKeyDown(e) {
  if (directionChangeCooldown > 0) return;
  
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      changeDirection('up');
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      changeDirection('down');
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      changeDirection('left');
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      changeDirection('right');
      break;
  }
}

function changeDirection(newDirection) {
  const opposites = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  };

  if (newDirection !== opposites[lastDirection] && newDirection !== lastDirection) {
    direction = newDirection;
    directionChangeCooldown = 2;
  }
}

function gameOver() {
  gameRunning = false;
  clearInterval(gameLoop);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
  }

  document.getElementById('finalScore').textContent = score;
  openGameOverModal();
}

function openGameOverModal() {
  const modal = document.getElementById('gameOverModal');
  modal.style.display = 'flex';
}

function closeGameOverModal() {
  const modal = document.getElementById('gameOverModal');
  modal.style.display = 'none';
}
