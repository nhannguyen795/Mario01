const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let gameStarted = false;
let difficulty = "normal";

let mario = {
    x: 40, y: 130, w: 18, h: 26, dy: 0, speed: 2.5,
    gravity: 0.45, jumpPower: -8.5, isGrounded: false
};

let coins = 0;
let cameraX = 0;
let keys = { left: false, right: false };
let worldWidth = 1200;

let blocks = [
    { x: 100, y: 100, w: 20, h: 20, type: "brick" },
    { x: 120, y: 100, w: 20, h: 20, type: "question", hit: false },
    { x: 140, y: 100, w: 20, h: 20, type: "brick" },
    { x: 350, y: 90, w: 20, h: 20, type: "question", hit: false },
    { x: 550, y: 100, w: 20, h: 20, type: "question", hit: false },
    { x: 800, y: 80, w: 20, h: 20, type: "question", hit: false }
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

window.initGame = function(mode) {
    difficulty = mode;
    gameStarted = true;
    const menuEl = document.getElementById("menu");
    if (menuEl) menuEl.style.display = "none";

    if (mode === "easy") mario.speed = 3;
    else if (mode === "normal") mario.speed = 2.5;
    else if (mode === "hard") { mario.speed = 2.2; mario.gravity = 0.5; }
    else if (mode === "impossible") { mario.speed = 2; mario.gravity = 0.55; mario.jumpPower = -8; }
};

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
    ctx.fillStyle = (difficulty === "impossible") ? "#000" : "#a81000";
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
            
