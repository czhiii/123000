let images1 = [];  // 玩家1的動畫幀
let images2 = [];  // 玩家2的動畫幀
let bgImage;      // 背景圖片
let heartImage;   // 生命值圖片
let bulletImage1, bulletImage2;  // 子彈圖片
let currentFrame = 0;
const TOTAL_FRAMES = 6;  // 動畫總幀數
let gameOver = false;    // 遊戲結束標誌

// 背景滾動相關變數
let bgX = 0;
const BG_SCROLL_SPEED = 0.5;

// 玩家1設定
let player1 = {
  x: 0,          // X座標
  y: 0,          // Y座標
  speedY: 0,     // Y軸速度
  isJumping: false,  // 跳躍狀態
  hearts: 5,     // 生命值
  bullets: []    // 子彈陣列
};

// 遊戲常數設定
const MOVE_SPEED = 5;    // 移動速度
const JUMP_FORCE = -15;  // 跳躍力度
const GRAVITY = 0.8;     // 重力
const BULLET_SPEED = 7;  // 子彈速度

let player2 = {
  x: 0,
  y: 0,
  speedY: 0,
  isJumping: false,
  hearts: 5,
  bullets: []
};

function preload() {
  bgImage = loadImage('111.jpg');
  heartImage = loadImage('heart.png');
  bulletImage1 = loadImage('0-1.png');
  bulletImage2 = loadImage('0-2.png');
  
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    images1[i] = loadImage(`${i}.png`);
    images2[i] = loadImage(`${i + 6}.png`);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  frameRate(12);
  
  bgX = -width/2;
  player1.x = width/2 - 200;
  player1.y = height/2;
  player2.x = width/2 + 200;
  player2.y = height/2;
}

function draw() {
  drawScrollingBackground();
  
  if (!gameOver) {
    handleMovement();
    updateBullets();
    checkCollisions();
    
    image(images1[currentFrame], player1.x, player1.y, 80, 80);
    
    push();
    translate(player2.x, player2.y);
    scale(-1, 1);
    image(images2[currentFrame], 0, 0, 80, 80);
    pop();
    
    displayHearts();
    currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
  } else {
    displayGameOver();
  }
}

function drawScrollingBackground() {
  image(bgImage, bgX, height/2, width, height);
  image(bgImage, bgX + width, height/2, width, height);
  image(bgImage, bgX - width, height/2, width, height);
}

function handleMovement() {
  // 玩家1控制 (A,D鍵移動)
  if (keyIsDown(65)) {  // A鍵
    player1.x -= MOVE_SPEED;
    bgX += MOVE_SPEED * BG_SCROLL_SPEED;
  }
  if (keyIsDown(68)) {  // D鍵
    player1.x += MOVE_SPEED;
    bgX -= MOVE_SPEED * BG_SCROLL_SPEED;
  }
  
  // 玩家2控制 (左右方向鍵移動)
  if (keyIsDown(LEFT_ARROW)) {
    player2.x -= MOVE_SPEED;
    bgX += MOVE_SPEED * BG_SCROLL_SPEED;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player2.x += MOVE_SPEED;
    bgX -= MOVE_SPEED * BG_SCROLL_SPEED;
  }
  
  if (bgX <= -width) {
    bgX += width;
  }
  if (bgX >= width) {
    bgX -= width;
  }
  
  updatePlayer(player1);
  updatePlayer(player2);
}

function updateBullets() {
  for (let i = player1.bullets.length - 1; i >= 0; i--) {
    player1.bullets[i].x += BULLET_SPEED;
    image(bulletImage1, player1.bullets[i].x, player1.bullets[i].y);
    if (player1.bullets[i].x > width) player1.bullets.splice(i, 1);
  }
  
  for (let i = player2.bullets.length - 1; i >= 0; i--) {
    player2.bullets[i].x -= BULLET_SPEED;
    image(bulletImage2, player2.bullets[i].x, player2.bullets[i].y);
    if (player2.bullets[i].x < 0) player2.bullets.splice(i, 1);
  }
}

function checkCollisions() {
  // 檢查玩家1子彈是否擊中玩家2
  for (let i = player1.bullets.length - 1; i >= 0; i--) {
    let b = player1.bullets[i];
    if (dist(b.x, b.y, player2.x, player2.y) < 50) {  // 碰撞檢測
      player2.hearts--;  // 減少生命值
      player1.bullets.splice(i, 1);  // 移除子彈
      checkGameOver();
    }
  }
  
  for (let i = player2.bullets.length - 1; i >= 0; i--) {
    let b = player2.bullets[i];
    if (dist(b.x, b.y, player1.x, player1.y) < 30) {
      player1.hearts--;
      player2.bullets.splice(i, 1);
      checkGameOver();
    }
  }
}

function displayHearts() {
  for (let i = 0; i < player1.hearts; i++) {
    image(heartImage, 30 + i * 30, 30, 25, 25);
  }
  
  for (let i = 0; i < player2.hearts; i++) {
    image(heartImage, width - 30 - i * 30, 30, 25, 25);
  }
}

function keyPressed() {
  // 遊戲結束時的重新開始控制
  if (gameOver) {
    if (key === ' ') {  // 空白鍵重新開始
      resetGame();
      return;
    }
  }
  
  // 跳躍控制
  if (key === 'w' && !player1.isJumping) {  // 玩家1使用W鍵跳躍
    player1.speedY = JUMP_FORCE;
    player1.isJumping = true;
  }
  if (keyCode === UP_ARROW && !player2.isJumping) {  // 玩家2使用上方向鍵跳躍
    player2.speedY = JUMP_FORCE;
    player2.isJumping = true;
  }
  
  // 發射子彈控制
  if (key === 'f') {  // 玩家1使用F鍵發射
    player1.bullets.push({x: player1.x, y: player1.y});
  }
  if (keyCode === 77) {  // 玩家2使用M鍵發射
    player2.bullets.push({x: player2.x, y: player2.y});
  }
}

function updatePlayer(player) {
  player.speedY += GRAVITY;
  player.y += player.speedY;
  
  if (player.y >= height/2) {
    player.y = height/2;
    player.speedY = 0;
    player.isJumping = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function checkGameOver() {
  if (player1.hearts <= 0 || player2.hearts <= 0) {
    gameOver = true;
  }
}

function displayGameOver() {
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255);
  stroke(0);
  strokeWeight(3);
  text('淡江教育科技展現你的創意', width/2, height/2 - 120);
  
  textSize(64);
  textAlign(CENTER, CENTER);
  fill(255);
  stroke(0);
  strokeWeight(4);
  text('遊戲結束', width/2, height/2 - 40);
  
  let winner = player1.hearts <= 0 ? '玩家2' : '玩家1';
  textSize(32);
  text(`${winner} 獲勝！`, width/2, height/2 + 40);
  
  textSize(24);
  text('按空白鍵重新開始', width/2, height/2 + 100);
}

function resetGame() {
  // 重置遊戲狀態
  gameOver = false;
  
  // 重置玩家位置
  bgX = -width/2;
  player1.x = width/2 - 200;
  player1.y = height/2;
  player2.x = width/2 + 200;
  player2.y = height/2;
  
  // 重置玩家屬性
  player1.hearts = 5;
  player1.bullets = [];
  player1.speedY = 0;
  player1.isJumping = false;
  
  player2.hearts = 5;
  player2.bullets = [];
  player2.speedY = 0;
  player2.isJumping = false;
}
