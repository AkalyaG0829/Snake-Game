const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const box = 20;
const canvasSize = 400;
let snake = [{ x: 9 * box, y: 10 * box }];
let direction = 'RIGHT';
let food = randomFood();
let score = 0;
let gameInterval;
let nextDirection = direction;
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') nextDirection = 'LEFT';
    else if (e.key === 'ArrowUp' && direction !== 'DOWN') nextDirection = 'UP';
    else if (e.key === 'ArrowRight' && direction !== 'LEFT') nextDirection = 'RIGHT';
    else if (e.key === 'ArrowDown' && direction !== 'UP') nextDirection = 'DOWN';
});

function randomFood() {
    return {
        x: Math.floor(Math.random() * (canvasSize / box)) * box,
        y: Math.floor(Math.random() * (canvasSize / box)) * box
    };
}
let spaceBgCanvas = document.createElement('canvas');
spaceBgCanvas.width = canvas.width;
spaceBgCanvas.height = canvas.height;
let spaceBgCtx = spaceBgCanvas.getContext('2d');
(function drawSpaceBg() {
    let spaceGradient = spaceBgCtx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 50,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.2
    );
    spaceGradient.addColorStop(0, '#22223b');
    spaceGradient.addColorStop(1, '#000014');
    spaceBgCtx.fillStyle = spaceGradient;
    spaceBgCtx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 80; i++) {
        let sx = Math.random() * canvas.width;
        let sy = Math.random() * canvas.height;
        let starRadius = Math.random() * 1.2 + 0.5;
        spaceBgCtx.beginPath();
        spaceBgCtx.arc(sx, sy, starRadius, 0, Math.PI * 2);
        spaceBgCtx.fillStyle = '#fff';
        spaceBgCtx.globalAlpha = 0.7 + Math.random() * 0.3;
        spaceBgCtx.fill();
    }
    spaceBgCtx.globalAlpha = 1;
})();
let asteroid = null;
let asteroidInterval = null;
let asteroidSpeed = 4;
let asteroidRadius = box * 0.7;

function spawnAsteroid() {
    let side = Math.floor(Math.random() * 4);
    let x, y, dx, dy;
    if (side === 0) { 
        x = Math.random() * canvas.width;
        y = -asteroidRadius * 2;
        dx = (snake[0].x + box / 2 - x) / 60;
        dy = (snake[0].y + box / 2 - y) / 60;
    } else if (side === 1) { 
        x = canvas.width + asteroidRadius * 2;
        y = Math.random() * canvas.height;
        dx = (snake[0].x + box / 2 - x) / 60;
        dy = (snake[0].y + box / 2 - y) / 60;
    } else if (side === 2) {
        x = Math.random() * canvas.width;
        y = canvas.height + asteroidRadius * 2;
        dx = (snake[0].x + box / 2 - x) / 60;
        dy = (snake[0].y + box / 2 - y) / 60;
    } else {
        x = -asteroidRadius * 2;
        y = Math.random() * canvas.height;
        dx = (snake[0].x + box / 2 - x) / 60;
        dy = (snake[0].y + box / 2 - y) / 60;
    }
    asteroid = { x, y, dx, dy };
}
function drawAsteroid() {
    if (!asteroid) return;
    asteroid.x += asteroid.dx * asteroidSpeed;
    asteroid.y += asteroid.dy * asteroidSpeed;
    ctx.save();
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroidRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#a1887f';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
    let head = snake[0];
    let dist = Math.hypot(asteroid.x - (head.x + box / 2), asteroid.y - (head.y + box / 2));
    if (dist < asteroidRadius + box / 2) {
        clearInterval(gameInterval);
        clearInterval(asteroidInterval);
        scoreEl.textContent = `Game Over! Hit by asteroid! Final Score: ${score}`;
    }
    if (
        asteroid.x < -asteroidRadius * 2 || asteroid.x > canvas.width + asteroidRadius * 2 ||
        asteroid.y < -asteroidRadius * 2 || asteroid.y > canvas.height + asteroidRadius * 2
    ) {
        asteroid = null;
    }
}
let rock = null;
let rockInterval = null;
let rockSpeed = 4;
let rockRadius = box * 0.7;

function spawnRock() {
    let x = Math.random() * (canvas.width - rockRadius * 2) + rockRadius;
    let y = -rockRadius * 2;
    rock = { x, y };
}

function drawRock() {
    if (!rock) return;
    rock.y += rockSpeed;
    ctx.save();
    ctx.translate(rock.x, rock.y);
    ctx.beginPath();
    let points = 8;
    let angleStep = (Math.PI * 2) / points;
    let baseRadius = rockRadius;
    for (let i = 0; i < points; i++) {
        let angle = i * angleStep;
        let radius = baseRadius * (0.8 + Math.random() * 0.4);
        let x = Math.cos(angle) * radius;
        let y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#757575';
    ctx.shadowColor = '#333';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
    let head = snake[0];
    let dist = Math.hypot(rock.x - (head.x + box / 2), rock.y - (head.y + box / 2));
    if (dist < rockRadius + box / 2) {
        clearInterval(gameInterval);
        if (typeof rockInterval !== 'undefined') clearInterval(rockInterval);
        scoreEl.textContent = `Game Over! Hit by rock! Final Score: ${score}`;
    }
    if (rock.y > canvas.height + rockRadius * 2) {
        rock = null;
    }
}

function draw() {
    ctx.drawImage(spaceBgCanvas, 0, 0);
    for (let i = 0; i < snake.length; i++) {
        if (i === snake.length - 1 && snake.length > 1) {
            ctx.fillStyle = '#800000'; 
        } else {
            ctx.fillStyle = 'red';
        }
        ctx.beginPath();
        ctx.arc(
            snake[i].x + box / 2,
            snake[i].y + box / 2,
            box / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        if (i === 0) {
            ctx.fillStyle = 'black';
            let eyeOffsetX = 0, eyeOffsetY = 0;
            let eyeDist = box / 4;
            let eyeRadius = box / 8;
            if (direction === 'LEFT') {
                eyeOffsetX = -eyeDist;
                eyeOffsetY = -eyeDist / 2;
                ctx.beginPath();
                ctx.arc(snake[i].x + box / 2 + eyeOffsetX, snake[i].y + box / 2 + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.arc(snake[i].x + box / 2 + eyeOffsetX, snake[i].y + box / 2 - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.fill();
            } else if (direction === 'RIGHT') {
                eyeOffsetX = eyeDist;
                eyeOffsetY = -eyeDist / 2;
                ctx.beginPath();
                ctx.arc(snake[i].x + box / 2 + eyeOffsetX, snake[i].y + box / 2 + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.arc(snake[i].x + box / 2 + eyeOffsetX, snake[i].y + box / 2 - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.fill();
            } else if (direction === 'UP') {
                eyeOffsetX = -eyeDist / 2;
                eyeOffsetY = -eyeDist;
                ctx.beginPath();
                ctx.arc(snake[i].x + box / 2 + eyeOffsetX, snake[i].y + box / 2 + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.arc(snake[i].x + box / 2 - eyeOffsetX, snake[i].y + box / 2 + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.fill();
            } else if (direction === 'DOWN') {
                eyeOffsetX = -eyeDist / 2;
                eyeOffsetY = eyeDist;
                ctx.beginPath();
                ctx.arc(snake[i].x + box / 2 + eyeOffsetX, snake[i].y + box / 2 + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.arc(snake[i].x + box / 2 - eyeOffsetX, snake[i].y + box / 2 + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    ctx.save();
    ctx.translate(food.x + box / 2, food.y + box / 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, box * 0.38, box * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(-box * 0.13, -box * 0.08, box * 0.08, box * 0.18, 0, 0, Math.PI * 2);
    ctx.ellipse(box * 0.13, -box * 0.08, box * 0.08, box * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-box * 0.08, box * 0.18);
    ctx.lineTo(box * 0.08, box * 0.18);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    direction = nextDirection;
    let head = { x: snake[0].x, y: snake[0].y };
    if (direction === 'LEFT') head.x -= box;
    if (direction === 'UP') head.y -= box;
    if (direction === 'RIGHT') head.x += box;
    if (direction === 'DOWN') head.y += box;
    if (head.x < 0) head.x = canvas.width - box;
    if (head.x >= canvas.width) head.x = 0;
    if (head.y < 0) head.y = canvas.height - box;
    if (head.y >= canvas.height) head.y = 0;
    if (collision(head, snake)) {
        clearInterval(gameInterval);
        if (typeof asteroidInterval !== 'undefined') clearInterval(asteroidInterval);
        scoreEl.textContent = `Game Over! You hit yourself! Final Score: ${score}`;
        return;
    }
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = randomFood();
    } else {
        snake.pop();
    }
    snake.unshift(head);
    scoreEl.textContent = `Score: ${score}`;
    drawAsteroid();
    drawRock();
}

function collision(head, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (head.x === arr[i].x && head.y === arr[i].y) {
            return true;
        }
    }
    return false;
}

function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    direction = 'RIGHT';
    nextDirection = direction;
    food = randomFood();
    score = 0;
    scoreEl.textContent = 'Score: 0';
    clearInterval(gameInterval);
    clearInterval(asteroidInterval);
    clearInterval(rockInterval);
    gameInterval = setInterval(draw, 150);
    asteroid = null;
    asteroidInterval = setInterval(spawnAsteroid, 10000);
    rock = null;
    clearInterval(rockInterval);
    rockInterval = setInterval(spawnRock, 5000); 
    spawnAsteroid();
    spawnRock();
}

startGame();
