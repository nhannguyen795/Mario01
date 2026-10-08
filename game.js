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
