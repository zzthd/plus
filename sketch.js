// --- 全局变量 ---
let mic;
let vol = 0;
let smoothedVol = 0; // 新增：用于平滑处理音量，减少抖动

// 存放三组动画的数组
let firstImages = []; // 开头待机动画
let guessImages = []; // 主交互动画（帘子）
let endImages = [];   // 结尾动画

// --- 状态控制变量 ---
let state = "intro"; // 可选状态: "intro", "main", "end"
let currentFrame = 0;
let lastFrameTime = 0;

// --- 动画速度控制 (数值越大，播放越慢) ---
const introFrameSpeed = 200; // 1. 开头动画速度，已调慢
const endFrameSpeed = 120;   // 结尾动画速度

// --- 麦克风灵敏度控制 ---
// 3. 提高了音量门槛，让交互对杂音不那么敏感
const micThreshold = 0.03;      // 判定交互开始的最低音量
const maxBlowVolume = 0.25;     // 吹气要达到这个音量才能把帘子吹到最高

function preload() {
  // 加载开头动画
  for (let i = 1; i <= 19; i++) {
    let filename = `first-${String(i).padStart(2, '0')}.png`;
    firstImages.push(loadImage(filename));
  }

  // 加载主交互动画（帘子）
  for (let i = 1; i <= 15; i++) {
    let filename = `guess-${String(i).padStart(2, '0')}.png`;
    guessImages.push(loadImage(filename));
  }

  // 加载结尾动画
  for (let i = 1; i <= 12; i++) {
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
  // 使用 lerp 函数对音量进行平滑处理，0.2是平滑度，值越小越平滑
  vol = mic.getLevel();
  smoothedVol = lerp(smoothedVol, vol, 0.2);
  
  let now = millis();

  // --- 状态机逻辑 ---

  if (state === "intro") {
    // 状态一：播放开头/待机动画
    if (now - lastFrameTime > introFrameSpeed) {
      currentFrame = (currentFrame + 1) % firstImages.length;
      lastFrameTime = now;
    }
    showImage(firstImages[currentFrame]);

    // 如果检测到吹气，则切换到主交互状态
    if (smoothedVol > micThreshold) {
      state = "main";
      currentFrame = 0; // 重置帧计数器
    }
  } 

  else if (state === "main") {
    // 状态二：主交互过程，根据吹气强度显示帘子高度
    // 2. 将平滑后的音量映射到帘子动画的帧数上
    let frameIndex = map(smoothedVol, micThreshold, maxBlowVolume, 0, guessImages.length - 1, true);
    currentFrame = floor(frameIndex);
    
    showImage(guessImages[currentFrame]);

    // 4. 如果帘子被吹到最高（即动画播放到最后一帧），则切换到结尾动画状态
    if (currentFrame >= guessImages.length - 1) {
      state = "end";
      currentFrame = 0; // 为结尾动画重置帧数
      lastFrameTime = now;
    }
    
    // 如果停止吹气，则回到待机状态
    if (smoothedVol < micThreshold) {
        state = "intro";
        currentFrame = 0;
    }
  } 

  else if (state === "end") {
    // 状态三：播放结尾动画
    if (now - lastFrameTime > endFrameSpeed) {
      currentFrame++;
      lastFrameTime = now;
    }
    
    // 4. 如果结尾动画播放完毕，则自动回到待机状态
    if (currentFrame >= endImages.length) {
      state = "intro";
      currentFrame = 0;
    } else {
      showImage(endImages[currentFrame]);
    }
  }
}

// 统一的图像显示函数
function showImage(img) {
  if (img && img.width > 0) {
    let scaleFactor = min(width / img.width, height / img.height);
    let w = img.width * scaleFactor;
    let h = img.height * scaleFactor;
    image(img, width / 2, height / 2, w, h);
  }
}

