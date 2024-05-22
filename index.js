document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    const menu = document.getElementById('menu');
    const pauseMenu = document.getElementById('pauseMenu');
    const gameOverScreen = document.getElementById('gameOver');
    const startButton = document.getElementById('startButton');
    const twoPlayerButton = document.getElementById('twoPlayerButton');
    const resumeButton = document.getElementById('resumeButton');
    const restartButton = document.getElementById('restartButton');
    const winningScoreInput = document.getElementById('winningScore');
    const scoreElement = document.getElementById('score');
    const scoreValue = document.getElementById('scoreValue');

    let isPaused = false;
    let interval;
    let playerScore = 0;
    let winningScore = 10;
    let upPressed = false;
    let downPressed = false;
    let wPressed = false;
    let sPressed = false;
    let isTwoPlayer = false;

    const paddleWidth = 10;
    const paddleHeight = 100;
    const ballRadius = 10;
    const playerPaddle = {
        x: 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        dy: 5
    };

    const computerPaddle = {
        x: canvas.width - paddleWidth - 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        dy: 5
    };

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: ballRadius,
        speed: 4,
        dx: 4,
        dy: -4
    };

    // Show menu initially
    menu.style.display = 'flex';

    // Event listeners for buttons
    startButton.addEventListener('click', () => startGame(false));
    twoPlayerButton.addEventListener('click', () => startGame(true));
    resumeButton.addEventListener('click', resumeGame);
    restartButton.addEventListener('click', restartGame);

    // Update score value display
    winningScoreInput.addEventListener('input', (e) => {
        scoreValue.textContent = e.target.value;
    });

    function startGame(twoPlayerMode) {
        menu.style.display = 'none';
        isTwoPlayer = twoPlayerMode;
        winningScore = parseInt(winningScoreInput.value);
        resetGame();
        interval = setInterval(updateGame, 20);
    }

    function resumeGame() {
        pauseMenu.style.display = 'none';
        isPaused = false;
        interval = setInterval(updateGame, 20);
    }

    function restartGame() {
        gameOverScreen.style.display = 'none';
        resetGame();
        interval = setInterval(updateGame, 20);
    }

    function resetGame() {
        playerPaddle.y = canvas.height / 2 - paddleHeight / 2;
        computerPaddle.y = canvas.height / 2 - paddleHeight / 2;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = 4 * (Math.random() > 0.5 ? 1 : -1);
        playerScore = 0;
        scoreElement.textContent = playerScore;
    }

    function updateGame() {
        if (isPaused) return;

        // Move player paddle
        if (upPressed && playerPaddle.y > 0) {
            playerPaddle.y -= playerPaddle.dy;
        } else if (downPressed && playerPaddle.y < canvas.height - paddleHeight) {
            playerPaddle.y += playerPaddle.dy;
        }

        // Move computer paddle or second player
        if (isTwoPlayer) {
            if (wPressed && computerPaddle.y > 0) {
                computerPaddle.y -= computerPaddle.dy;
            } else if (sPressed && computerPaddle.y < canvas.height - paddleHeight) {
                computerPaddle.y += computerPaddle.dy;
            }
        } else {
            moveComputerPaddle();
        }

        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Ball collision with top and bottom walls
        if (ball.y + ball.dy > canvas.height - ball.radius || ball.y + ball.dy < ball.radius) {
            ball.dy = -ball.dy;
        }

        // Ball collision with paddles
        if (
            ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
            ball.y > playerPaddle.y &&
            ball.y < playerPaddle.y + playerPaddle.height
        ) {
            ball.dx = -ball.dx;
        }

        if (
            ball.x + ball.radius > computerPaddle.x &&
            ball.y > computerPaddle.y &&
            ball.y < computerPaddle.y + computerPaddle.height
        ) {
            ball.dx = -ball.dx;
        }

        // Ball out of bounds
        if (ball.x + ball.dx > canvas.width - ball.radius) {
            playerScore++;
            scoreElement.textContent = playerScore;
            if (playerScore >= winningScore) {
                endGame();
                return;
            }
            resetBall();
        } else if (ball.x + ball.dx < ball.radius) {
            endGame();
            return;
        }

        // Draw everything
        drawGame();
    }

    function moveComputerPaddle() {
        if (computerPaddle.y + computerPaddle.height / 2 < ball.y) {
            computerPaddle.y += computerPaddle.dy;
        } else {
            computerPaddle.y -= computerPaddle.dy;
        }

        if (computerPaddle.y < 0) {
            computerPaddle.y = 0;
        } else if (computerPaddle.y + paddleHeight > canvas.height) {
            computerPaddle.y = canvas.height - paddleHeight;
        }
    }

    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        drawGrid();

        // Draw green border on player side
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Draw red horizontal border in the middle of the field
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // Remove shadow blur for other elements
        ctx.shadowBlur = 0;

        // Draw player paddle
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);

        // Draw computer paddle
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);

        // Draw the ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff00';
        ctx.fill();
        ctx.closePath();
    }

    function drawGrid() {
        const gridSize = 20;
        for (let x = 0; x < canvas.width; x += gridSize) {
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.strokeRect(x, y, gridSize, gridSize);
            }
        }
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = 4 * (Math.random() > 0.5 ? 1 : -1);
    }

    function endGame() {
        clearInterval(interval);
        gameOverScreen.style.display = 'flex';
    }

    // Control the game with the space bar and paddle movements
    document.addEventListener('keydown', e => {
        if (e.key === ' ') {
            if (!isPaused) {
                clearInterval(interval);
                isPaused = true;
                pauseMenu.style.display = 'flex';
            } else {
                resumeGame();
            }
        } else if (e.key === 'ArrowUp') {
            upPressed = true;
        } else if (e.key === 'ArrowDown') {
            downPressed = true;
        } else if (e.key === 'w') {
            wPressed = true;
        } else if (e.key === 's') {
            sPressed = true;
        }
    });

    document.addEventListener('keyup', e => {
        if (e.key === 'ArrowUp') {
            upPressed = false;
        } else if (e.key === 'ArrowDown') {
            downPressed = false;
        } else if (e.key === 'w') {
            wPressed = false;
        } else if (e.key === 's') {
            sPressed = false;
        }
    });
});
