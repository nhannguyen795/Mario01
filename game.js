const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Thông số Mario
let mario = {
    x: 40, y: 130, w: 18, h: 26, dy: 0, speed: 2.5,
    gravity: 0.45, jumpPower: -8.5, isGrounded: false, direction: "right"
};

let keys = { left: false, right: false };

// Các vật thể trong màn chơi (Gạch, khối hỏi chấm, ống cống, nấm Goomba)
let blocks = [
    { x: 40, y: 100, w: 20, h: 20, type: "brick" },
    { x: 60, y: 100, w: 20, h: 20, type: "question" },
    { x: 80, y: 100, w: 20, h: 20, type: "brick" }
];

let pipes = [{ x: 260, y: 120, w: 32, h: 40 }];

let enemies = [
    { x: 160, y: 144, w: 16, h: 16, dir: -1, alive: true },
    { x: 200, y: 144, w: 16, h: 16, dir: 1, alive: true }
];

// --- HÀM VẼ ĐỒ HỌA PIXEL cổ điển ---

// Vẽ nền gạch đất dưới sàn
function drawGround() {
    const groundY = 160;
    ctx.fillStyle = "#c84c0c"; // Màu nền gạch nâu
    ctx.fillRect(0, groundY, canvas.width, 40);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 16) {
        for (let y = groundY; y < canvas.height; y += 10) {
            ctx.strokeRect(x, y, 16, 10);
            ctx.fillStyle = "#fc9838"; // Điểm sáng gạch
            ctx.fillRect(x + 2, y + 2, 12, 2);
        }
    }
}

// Vẽ Mario 8-bit
function drawMario() {
    ctx.fillStyle = "#e40058"; // Mũ & Áo đỏ
    ctx.fillRect(mario.x + 2, mario.y, 14, 6);
    ctx.fillRect(mario.x + 2, mario.y + 12, 14, 8);

    ctx.fillStyle = "#fc9838"; // Mặt màu da
    ctx.fillRect(mario.x + 4, mario.y + 6, 10, 6);

    ctx.fillStyle = "#0000d8"; // Quần yếm xanh
    ctx.fillRect(mario.x + 4, mario.y + 18, 10, 8);
}

// Vẽ nấm Goomba
function drawGoomba(e) {
    if (!e.alive) return;
    ctx.fillStyle = "#a81000"; // Đầu nấm nâu đỏ
    ctx.fillRect(e.x + 2, e.y, 12, 10);
    ctx.fillStyle = "#fc9838"; // Chân nấm
    ctx.fillRect(e.x, e.y + 10, 16, 6);
    ctx.fillStyle = "#fff"; // Mắt
    ctx.fillRect(e.x + 3, e.y + 4, 3, 4);
    ctx.fillRect(e.x + 10, e.y + 4, 3, 4);
}

// Vẽ các khối gạch & Khối ?
function drawBlocks() {
    blocks.forEach(b => {
        if (b.type === "brick") {
            ctx.fillStyle = "#c84c0c";
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(b.x, b.y, b.w, b.h);
        } else if (b.type === "question") {
            ctx.fillStyle = "#fc9838";
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = "#000";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText("?", b.x + 6, b.y + 15);
        }
    });
}

// Vẽ ống cống
function drawPipes() {
    pipes.forEach(p => {
        ctx.fillStyle = "#00a800";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "#00d800";
        ctx.fillRect(p.x - 2, p.y, p.w + 4, 10); // Vành ống
        ctx.strokeStyle = "#000";
        ctx.strokeRect(p.x, p.y, p.w, p.h);
    });
}

// Cập nhật logic di chuyển & va chạm
function update() {
    if (keys.left && mario.x > 0) mario.x -= mario.speed;
    if (keys.right && mario.x < canvas.width - mario.w) mario.x += mario.speed;

    mario.dy += mario.gravity;
    mario.y += mario.dy;

    // Mặt đất
    if (mario.y + mario.h >= 160) {
        mario.y = 160 - mario.h;
        mario.dy = 0;
        mario.isGrounded = true;
    }

    // Va chạm kẻ địch
    enemies.forEach(e => {
        if (!e.alive) return;
        e.x += e.dir * 0.5;
        if (e.x <= 130 || e.x >= 240) e.dir *= -1;

        // Mario giẫm lên nấm
        if (mario.x < e.x + e.w && mario.x + mario.w > e.x &&
            mario.y + mario.h >= e.y && mario.y + mario.h <= e.y + 8 && mario.dy > 0) {
            e.alive = false;
            mario.dy = mario.jumpPower * 0.6;
        } else if (mario.x < e.x + e.w && mario.x + mario.w > e.x &&
                   mario.y < e.y + e.h && mario.y + mario.h > e.y) {
            // Reset Mario nếu chạm hông kẻ địch
            mario.x = 40; mario.y = 130;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawBlocks();
    drawPipes();
    enemies.forEach(drawGoomba);
    drawMario();
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
