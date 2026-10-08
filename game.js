const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Thông số Mario
let mario = {
    x: 40, y: 130, w: 18, h: 26, dy: 0, speed: 2.5,
    gravity: 0.45, jumpPower: -8.5, isGrounded: false
};

let coins = 0; // Số tiền tệ
let keys = { left: false, right: false };

// Các khối gạch & khối ?
let blocks = [
    { x: 40, y: 100, w: 20, h: 20, type: "brick" },
    { x: 60, y: 100, w: 20, h: 20, type: "question", hit: false },
    { x: 80, y: 100, w: 20, h: 20, type: "brick" }
];

let pipes = [{ x: 260, y: 120, w: 32, h: 40 }];

// Cây ăn thịt người (Piranha Plant) trong ống cống
let piranha = {
    x: 268, y: 120, w: 16, h: 20,
    visible: false, timer: 0
};

let enemies = [
    { x: 160, y: 144, w: 16, h: 16, dir: -1, alive: true },
    { x: 200, y: 144, w: 16, h: 16, dir: 1, alive: true }
];

// Hiệu ứng đồng xu nảy lên
let coinEffect = { x: 0, y: 0, dy: 0, active: false };

// --- HÀM VẼ ĐỒ HỌA ---

function drawGround() {
    const groundY = 160;
    ctx.fillStyle = "#c84c0c";
    ctx.fillRect(0, groundY, canvas.width, 40);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 16) {
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
    ctx.fillStyle = "#a81000";
    ctx.fillRect(e.x + 2, e.y, 12, 10);
    ctx.fillStyle = "#fc9838";
    ctx.fillRect(e.x, e.y + 10, 16, 6);
    ctx.fillStyle = "#fff";
    ctx.fillRect(e.x + 3, e.y + 4, 3, 4);
    ctx.fillRect(e.x + 10, e.y + 4, 3, 4);
}

function drawPiranha() {
    if (!piranha.visible) return;
    // Thân cây
    ctx.fillStyle = "#00d800";
    ctx.fillRect(piranha.x + 6, piranha.y + 10, 4, piranha.h - 10);
    // Đầu cây ăn thịt
    ctx.fillStyle = "#e40058";
    ctx.fillRect(piranha.x, piranha.y, piranha.w, 12);
    // Răng
    ctx.fillStyle = "#fff";
    ctx.fillRect(piranha.x + 2, piranha.y + 5, 3, 3);
    ctx.fillRect(piranha.x + 11, piranha.y + 5, 3, 3);
}

function drawBlocks() {
    blocks.forEach(b => {
        if (b.type === "brick") {
            ctx.fillStyle = "#c84c0c";
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(b.x, b.y, b.w, b.h);
        } else if (b.type === "question") {
            ctx.fillStyle = b.hit ? "#808080" : "#fc9838"; // Chuyển màu xám khi đã cụng
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
    // Hiển thị số coin trên góc trái
    ctx.fillStyle = "#f8d800";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("🪙 COINS: " + coins, 10, 20);

    // Đồng xu nảy lên
    if (coinEffect.active) {
        ctx.fillStyle = "#f8d800";
        ctx.beginPath();
        ctx.arc(coinEffect.x, coinEffect.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Cập nhật logic game
function update() {
    if (keys.left && mario.x > 0) mario.x -= mario.speed;
    if (keys.right && mario.x < canvas.width - mario.w) mario.x += mario.speed;

    mario.dy += mario.gravity;
    mario.y += mario.dy;

    // Sàn nhà
    if (mario.y + mario.h >= 160) {
        mario.y = 160 - mario.h;
        mario.dy = 0;
        mario.isGrounded = true;
    }

    // Va chạm với khối ? (Cụng đầu lấy coin)
    blocks.forEach(b => {
        if (mario.x < b.x + b.w && mario.x + mario.w > b.x &&
            mario.y <= b.y + b.h && mario.y >= b.y && mario.dy < 0) {
            mario.dy = 1; // Bật ngược xuống
            if (b.type === "question" && !b.hit) {
                b.hit = true;
                coins += 1; // Cộng tiền
                coinEffect = { x: b.x + 10, y: b.y - 5, dy: -3, active: true };
            }
        }
    });

    // Cập nhật vị trí hiệu ứng coin
    if (coinEffect.active) {
        coinEffect.y += coinEffect.dy;
        coinEffect.dy += 0.2;
        if (coinEffect.dy > 2) coinEffect.active = false;
    }

    // Logic cây ăn thịt trồi lên mỗi 10 giây (600 frames = ~10s)
    piranha.timer++;
    if (piranha.timer % 600 < 180) { // Hiện trong ~3 giây mỗi 10 giây
        piranha.visible = true;
        piranha.y = 102; // Trồi lên khỏi ống
    } else {
        piranha.visible = false;
        piranha.y = 120; // Ẩn vào ống
    }

    // Va chạm cây ăn thịt
    if (piranha.visible &&
        mario.x < piranha.x + piranha.w && mario.x + mario.w > piranha.x &&
        mario.y < piranha.y + piranha.h && mario.y + mario.h > piranha.y) {
        mario.x = 40; mario.y = 130; // Chết, reset vị trí
    }

    // Va chạm kẻ địch Goomba
    enemies.forEach(e => {
        if (!e.alive) return;
        e.x += e.dir * 0.5;
        if (e.x <= 130 || e.x >= 240) e.dir *= -1;

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
    drawGround();
    drawBlocks();
    drawPiranha();
    drawPipes();
    enemies.forEach(drawGoomba);
    drawMario();
    drawUI();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Điều khiển
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
