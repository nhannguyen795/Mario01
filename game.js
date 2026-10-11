const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let gameStarted = false;
let difficulty = "normal";

let mario = {
    x: 40, y: 130, w: 18, h: 26, dy: 0, speed: 2.5,
    gravity: 0.45, jumpPower: -8.5, isGrounded: false
};

let coins = 0;
let cameraX = 0; // Tọa độ cuộn màn hình
let keys = { left: false, right: false };

// Bản đồ dài hơn (chiều rộng lên tới 1200 pixel)
let worldWidth = 1200;

let blocks = [
    { x: 100, y: 100, w: 20, h: 20, type: "brick" },
    { x: 120, y: 100, w: 20, h: 20, type: "question", hit: false },
    { x: 140, y: 100, w: 20, h: 20, type: "brick" },
    { x: 350, y: 90, w: 20, h: 20, type: "question", hit: false },
    { x: 550, y: 100, w: 20, h: 20, type: "question", hit: false },
    { x: 800, y: 80, w: 20, h: 20, type: "question", hit: false },
    { x: 820, y: 80, w: 20, h: 20, type: "brick" }
];

let pipes = [
    { x: 280, y: 120, w: 32, h: 40 },
    { x: 600, y: 120, w: 32, h: 40 },
    { x: 950, y: 120, w: 32, h: 40 }
];

let piranhas = [
    { x: 288, y: 120, w: 16, h: 20, visible: false, timer: 0 },
    { x: 608, y: 120, w: 16, h: 20, visible: false, timer: 100 },
    { x: 958, y: 120, w: 16, h: 20, visible: false, timer: 200 }
];

let enemies = [
    { x: 200, y: 144, w: 16, h: 16, dir: -1, alive: true },
    { x: 450, y: 144, w: 16, h: 16, dir: 1, alive: true },
    { x: 700, y: 144, w: 16, h: 16, dir: -1, alive: true },
    { x: 1050, y: 144, w: 16, h: 16, dir: 1, alive: true }
];

let coinEffect = { x: 0, y: 0, dy: 0, active: false };

function startGame(mode) {
    difficulty = mode;
    gameStarted = true;
    document.getElementById("menu").style.display = "none";

    // Thiết lập độ khó
    if (mode === "easy") {
        mario.speed = 3;
        enemies.forEach(e => e.speedFactor = 0.5);
    } else if (mode === "normal") {
        mario.speed = 2.5;
    } else if (mode === "hard") {
        mario.speed = 2.2;
        mario.gravity = 0.5;
    } else if (mode === "impossible") {
        mario.speed = 2;
        mario.gravity = 0.55;
        mario.jumpPower = -8;
    }
}

function drawGround() {
    const groundY = 160;
    ctx.fillStyle = "#c84c0c";
    ctx.fillRect(0, groundY, worldWidth, 40);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    for (let x = 0; x < worldWidth; x += 16) {
        for (let y = groundY; y < canvas.height; y += 10) {
            ctx.strokeRect(x, y, 16, 10);
            ctx.fillStyle = "#fc9838";
            ctx.fillRect(x + 2, y + 2, 12, 2);
        }
    }
}

function drawMario() {
    ctx.fillStyle = "#e40058";
    ctx.fillRect(mario.x + 2, mario.y, 14, 6);
    ctx.fillRect(mario.x + 2, mario.y + 12, 14, 8);

    ctx.fillStyle = "#fc9838";
    ctx.fillRect(mario.x + 4, mario.y + 6, 10, 6);

    ctx.fillStyle = "#0000d8";
    ctx.fillRect(mario.x + 4, mario.y + 18, 10, 8);
}

function drawGoomba(e) {
    if (!e.alive) return;
    ctx.fillStyle = (difficulty === "impossible") ? "#000" : "#a81000"; // Impossible đổi màu kẻ địch thành đen nguy hiểm
    ctx.fillRect(e.x + 2, e.y, 12, 10);
    ctx.fillStyle = "#fc9838";
    ctx.fillRect(e.x, e.y + 10, 16, 6);
    ctx.fillStyle = "#fff";
    ctx.fillRect(e.x + 3, e.y + 4, 3, 4);
    ctx.fillRect(e.x + 10, e.y + 4, 3, 4);
}

function drawPiranhas() {
    piranhas.forEach(p => {
        if (!p.visible) return;
        ctx.fillStyle = "#00d800";
        ctx.fillRect(p.x + 6, p.y + 10, 4, p.h - 10);
        ctx.fillStyle = "#e40058";
        ctx.fillRect(p.x, p.y, p.w, 12);
        ctx.fillStyle = "#fff";
        ctx.fillRect(p.x + 2, p.y + 5, 3, 3);
        ctx.fillRect(p.x + 11, p.y + 5, 3, 3);
    });
}

function drawBlocks() {
    blocks.forEach(b => {
        if (b.type === "brick") {
            ctx.fillStyle = "#c84c0c";
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(b.x, b.y, b.w, b.h);
        } else if (b.type === "question") {
            ctx.fillStyle = b.hit ? "#808080" : "#fc9838";
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = "#000";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(b.hit ? "" : "?", b.x + 6, b.y + 15);
        }
    });
}

function drawPipes() {
    pipes.forEach(p => {
        ctx.fillStyle = "#00a800";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "#00d800";
        ctx.fillRect(p.x - 2, p.y, p.w + 4, 10);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(p.x, p.y, p.w, p.h);
    });
}

function drawUI() {
    ctx.fillStyle = "#f8d800";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("🪙 COINS: " + coins + " | MODE: " + difficulty.toUpperCase(), 15, 20);

    if (coinEffect.active) {
        ctx.fillStyle = "#f8d800";
        ctx.beginPath();
        ctx.arc(coinEffect.x, coinEffect.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function update() {
    if (!gameStarted) return;

    if (keys.left && mario.x > 0) mario.x -= mario.speed;
    if (keys.right && mario.x < worldWidth - mario.w) mario.x += mario.speed;

    // Cuộn màn hình (Camera đi theo Mario)
    cameraX = mario.x - canvas.width / 2;
    if (cameraX < 0) cameraX = 0;
    if (cameraX > worldWidth - canvas.width) cameraX = worldWidth - canvas.width;

    mario.dy += mario.gravity;
    mario.y += mario.dy;

    if (mario.y + mario.h >= 160) {
        mario.y = 160 - mario.h;
        mario.dy = 0;
        mario.isGrounded = true;
    }

    // Va chạm khối gạch / hỏi chấm
    blocks.forEach(b => {
        if (mario.x < b.x + b.w && mario.x + mario.w > b.x &&
            mario.y <= b.y + b.h && mario.y >= b.y && mario.dy < 0) {
            mario.dy = 1;
            if (b.type === "question" && !b.hit) {
                b.hit = true;
                coins += 1;
                coinEffect = { x: b.x + 10, y: b.y - 5, dy: -3, active: true };
            }
        }
    });

    if (coinEffect.active) {
        coinEffect.y += coinEffect.dy;
        coinEffect.dy += 0.2;
        if (coinEffect.dy > 2) coinEffect.active = false;
    }

    // Xử lý cây ăn thịt (10s trồi lên 1 lần, tùy độ khó thời gian ẩn hiện có thể nhanh hơn)
    let hideDuration = (difficulty === "impossible") ? 120 : 420; 
    piranhas.forEach(p => {
        p.timer++;
        if (p.timer % 600 < 180) {
            p.visible = true;
            p.y = 102;
        } else {
            p.visible = false;
            p.y = 120;
        }

        if (p.visible &&
            mario.x < p.x + p.w && mario.x + mario.w > p.x &&
            mario.y < p.y + p.h && mario.y + mario.h > p.y) {
            mario.x = 40; mario.y = 130; // Chết -> Reset về đầu
        }
    });

    // Xử lý kẻ địch
    enemies.forEach(e => {
        if (!e.alive) return;
        let speed = (difficulty === "easy") ? 0.3 : (difficulty === "hard" || difficulty === "impossible") ? 1 : 0.6;
        e.x += e.dir * speed;
        if (e.x <= 150 || e.x >= worldWidth - 100) e.dir *= -1;

        if (mario.x < e.x + e.w && mario.x + mario.w > e.x &&
            mario.y + mario.h >= e.y && mario.y + mario.h <= e.y + 8 && mario.dy > 0) {
            e.alive = false;
            mario.dy = mario.jumpPower * 0.6;
        } else if (mario.x < e.x + e.w && mario.x + mario.w > e.x &&
                   mario.y < e.y + e.h && mario.y + mario.h > e.y) {
            mario.x = 40; mario.y = 130;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-cameraX, 0); // Dịch chuyển màn hình theo camera

    drawGround();
    drawBlocks();
    drawPiranhas();
    drawPipes();
    enemies.forEach(drawGoomba);
    drawMario();

    ctx.restore();

    drawUI(); // Giao diện cố định không bị trôi theo camera
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Bàn phím & Cảm ứng
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
    if (!btn) return;
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
