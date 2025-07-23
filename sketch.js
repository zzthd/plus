let mic;
let vol = 0;
let firstImages = [];
let guessImages = [];
let endImages = [];

let state = "intro"; // 可选：intro, main, end
let currentFrame = 0;
let lastFrameTime = 0;

const firstFrameSpeed = 200; // 开头动画慢速
const mainFrameSpeed = 80;   // 主动画节奏
const endFrameSpeed = 120;   // 结尾动画稍慢

function preload() {
  for (let i = 1; i <= 19; i++) {
    let filename = `first-${String(i).padStart(2, '0')}.png`;
    firstImages.push(loadImage(filename));
  }

  for (let i = 1; i <= 15; i++) {
    let filename = `guess-${String(i).padStart(2, '0')}.png`;
    guessImages.push(loadImage(filename));
  }

  for (let i = 1; i <= 9; i++) {
    let filename = `end-${String(i).padStart(2, '0')}.png`;
    endImages.push(loadImage(filename));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();
  mic.start();
  imageMode(CENTER);
}

function draw() {
  background(255);
  vol = mic.getLevel();
  let now = millis();

  if (state === "intro") {
    if (now - lastFrameTime > firstFrameSpeed) {
      currentFrame++;
      lastFrameTime = now;
      if (currentFrame >= firstImages.length) {
        currentFrame = 0;
        state = "main";
      }
    }
    showImage(firstImages[currentFrame]);
  }

  else if (state === "main") {
    if (now - lastFrameTime > mainFrameSpeed) {
      currentFrame = min(currentFrame + 1, guessImages.length - 1);
      lastFrameTime = now;

      // 如果强度达到峰值，自动触发结尾动画
      if (vol > 0.5) {
        currentFrame = 0;
        state = "end";
      }
    }
    showImage(guessImages[currentFrame]);
  }

  else if (state === "end") {
    if (now - lastFrameTime > endFrameSpeed) {
      currentFrame++;
      lastFrameTime = now;
      if (currentFrame >= endImages.length) {
        currentFrame = endImages.length - 1; // 结束后停在最后一帧
      }
    }
    showImage(endImages[currentFrame]);
  }
}

function showImage(img) {
  if (img && img.width > 0) {
    let scaleFactor = min(width / img.width, height / img.height) * 0.98;
    let w = img.width * scaleFactor;
    let h = img.height * scaleFactor;
    image(img, width / 2, height / 2, w, h);
  }
}

