const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let mario = { x: 30, y: 140, w: 20, h: 30, dy: 0, speed: 3, gravity: 0.5, jumpPower: -9, isGrounded: false };
let keys = { left: false, right: false };
let obstacles = [{ x: 150, w: 25, h: 35 }, { x: 270, w: 25, h: 50 }];

function update() {
    if (keys.left && mario.x > 0) mario.x -= mario.speed;
    if (keys.right && mario.x < canvas.width - mario.w) mario.x += mario.speed;

    mario.dy += mario.gravity;
    mario.y += mario.dy;

    if (mario.y + mario.h >= canvas.height) {
        mario.y = canvas.height - mario.h;
        mario.dy = 0;
        mario.isGrounded = true;
    }

    obstacles.forEach(obs => {
        if (mario.x < obs.x + obs.w && mario.x + mario.w > obs.x && mario.y + mario.h > canvas.height - obs.h) {
            mario.x = 30; mario.y = 140; mario.dy = 0;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ff2222";
    ctx.fillRect(mario.x, mario.y, mario.w, mario.h);
    ctx.fillStyle = "#aa0000";
    ctx.fillRect(mario.x, mario.y, mario.w + 3, 6);

    obstacles.forEach(obs => {
        ctx.fillStyle = "#00aa00";
        ctx.fillRect(obs.x, canvas.height - obs.h, obs.w, obs.h);
        ctx.fillStyle = "#00dd00";
        ctx.fillRect(obs.x - 2, canvas.height - obs.h, obs.w + 4, 8);
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
    if ((e.key === "ArrowUp" || e.key === " " || e.key === "w") && mario.isGrounded) {
        mario.dy = mario.jumpPower; mario.isGrounded = false;
    }
});

window.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
});

function setupTouchButton(id, onPress, onRelease) {
    const btn = document.getElementById(id);
    btn.addEventListener("touchstart", e => { e.preventDefault(); onPress(); });
    btn.addEventListener("touchend", e => { e.preventDefault(); if (onRelease) onRelease(); });
    btn.addEventListener("mousedown", onPress);
    btn.addEventListener("mouseup", onRelease);
}

setupTouchButton("leftBtn", () => keys.left = true, () => keys.left = false);
setupTouchButton("rightBtn", () => keys.right = true, () => keys.right = false);
setupTouchButton("jumpBtn", () => {
    if (mario.isGrounded) { mario.dy = mario.jumpPower; mario.isGrounded = false; }
});

gameLoop();
