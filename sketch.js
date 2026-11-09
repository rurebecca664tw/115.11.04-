let backgroundImage; // 宣告背景圖片變數

let stopSprite; // 宣告待機動畫精靈圖變數
let runSprite; // 宣告跑步動畫精靈圖變數

const stopFrameCount = 4; // 設定待機精靈圖總格數為 4 格
const runFrameCount = 4; // 設定跑步精靈圖總格數為 4 格

const backgroundOriginalWidth = 1536; // 設定背景圖片原始寬度
const backgroundOriginalHeight = 1024; // 設定背景圖片原始高度

const designWidth = 1536; // 設定角色縮放的基準畫面寬度
const designHeight = 1024; // 設定角色縮放的基準畫面高度

const characterBaseScale = 2; // 設定角色原始單格圖片的放大倍率
const baseMoveSpeed = 5; // 設定角色在基準畫面中的移動速度

const frameInterval = 8; // 設定動畫每隔 8 個畫面切換一次
const bottomMargin = 40; // 設定角色與畫面底部至少保留 40 像素
const characterBelowBackgroundRatio = 0.15; // 設定角色位於背景底部下方 1.5/10 的位置

const skyBlue = "#87CEEB"; // 設定背景補色為天空藍

let scaleFactor = 1; // 儲存角色與畫面的等比例縮放倍率

let backgroundScale = 1; // 儲存背景圖片的縮放倍率
let backgroundX = 0; // 儲存背景圖片的水平位置
let backgroundY = 0; // 儲存背景圖片的垂直位置
let backgroundWidth = 0; // 儲存背景圖片縮放後的寬度
let backgroundHeight = 0; // 儲存背景圖片縮放後的高度

let characterX; // 儲存角色中心點的水平座標
let characterY; // 儲存角色中心點的垂直座標
let characterHorizontalRatio = 0.5; // 儲存角色水平位置比例

let currentFrame = 0; // 儲存目前播放的動畫格索引
let frameTimer = 0; // 儲存動畫播放計時器
let previousMovingState = false; // 儲存上一個畫面角色是否正在移動

function preload() { // 在建立畫布前先載入圖片資源
  backgroundImage = loadImage("background.png"); // 載入背景圖片
  stopSprite = loadImage("keroro/stop/stop.png"); // 載入角色待機動畫精靈圖
  runSprite = loadImage("keroro/run/run.png"); // 載入角色跑步動畫精靈圖
} // 結束 preload 函式

function setup() { // 執行一次初始化設定
  createCanvas(windowWidth, windowHeight); // 建立符合瀏覽器視窗大小的畫布
  imageMode(CORNER); // 設定圖片繪製模式為左上角定位
  frameRate(60); // 將畫面更新速率設定為每秒 60 格
  updateLayout(); // 根據目前畫面大小計算背景與角色縮放資料
  characterX = width / 2; // 將角色初始水平位置設定在畫面中央
  characterY = getCharacterY(0); // 計算角色初始垂直位置
} // 結束 setup 函式

function draw() { // 每一格畫面都會重複執行的主要函式
  drawBackground(); // 繪製完整且不變形的背景圖片

  const movingLeft = keyIsDown(LEFT_ARROW); // 判斷是否按住鍵盤左方向鍵
  const movingRight = keyIsDown(RIGHT_ARROW); // 判斷是否按住鍵盤右方向鍵
  const isMoving = movingLeft || movingRight; // 判斷角色目前是否正在移動
  const facingLeft = movingLeft && !movingRight; // 判斷角色是否需要面向左方

  if (movingLeft && !movingRight) { // 如果只按住左方向鍵
    characterX -= getMoveSpeed(); // 讓角色依照縮放比例向左移動
  } // 結束左移判斷

  if (movingRight && !movingLeft) { // 如果只按住右方向鍵
    characterX += getMoveSpeed(); // 讓角色依照縮放比例向右移動
  } // 結束右移判斷

  if (isMoving !== previousMovingState) { // 如果角色的移動狀態發生改變
    currentFrame = 0; // 切換動畫時從第一格開始
    frameTimer = 0; // 將動畫計時器歸零
    previousMovingState = isMoving; // 記錄目前的移動狀態
  } // 結束移動狀態變更判斷

  const sprite = isMoving ? runSprite : stopSprite; // 移動時使用跑步圖片，停止時使用待機圖片
  const frameCount = isMoving ? runFrameCount : stopFrameCount; // 取得目前動畫的總格數

  if (!isImageReady(sprite)) { // 如果目前精靈圖尚未載入完成
    return; // 暫停繪製角色避免發生錯誤
  } // 結束圖片載入判斷

  const safeFrame = currentFrame % frameCount; // 確保動畫索引不會超出範圍
  const frameData = getFrameData(sprite, frameCount, safeFrame); // 取得目前動畫格的資料

  const displayWidth = frameData.sourceWidth * characterBaseScale * scaleFactor; // 計算角色縮放後的寬度
  const displayHeight = frameData.sourceHeight * characterBaseScale * scaleFactor; // 計算角色縮放後的高度

  characterY = getCharacterY(displayHeight); // 根據背景位置計算角色垂直位置
  characterX = constrainCharacterX(characterX, displayWidth); // 限制角色不能超出左右邊界
  characterY = constrainCharacterY(characterY, displayHeight); // 限制角色不能超出上下邊界
  characterHorizontalRatio = characterX / width; // 儲存角色目前的水平比例位置

  updateAnimation(isMoving, frameCount); // 更新目前播放的動畫格
  drawCharacter(sprite, frameData, displayWidth, displayHeight, facingLeft); // 繪製角色目前的動畫格
} // 結束 draw 函式

function updateLayout() { // 根據目前畫面大小更新背景與角色縮放資料
  scaleFactor = min(width / designWidth, height / designHeight); // 使用較小比例進行等比例縮放

  if (!isImageReady(backgroundImage)) { // 如果背景圖片尚未載入完成
    return; // 暫停背景尺寸計算
  } // 結束背景圖片載入判斷

  backgroundScale = min(width / backgroundOriginalWidth, height / backgroundOriginalHeight); // 使用 contain 計算背景縮放倍率
  backgroundWidth = backgroundOriginalWidth * backgroundScale; // 計算背景縮放後的寬度
  backgroundHeight = backgroundOriginalHeight * backgroundScale; // 計算背景縮放後的高度
  backgroundX = (width - backgroundWidth) / 2; // 將背景圖片水平置中
  backgroundY = (height - backgroundHeight) / 2; // 將背景圖片垂直置中
} // 結束 updateLayout 函式

function drawBackground() { // 繪製背景圖片
  background(skyBlue); // 先用天空藍填滿整個畫布

  if (!isImageReady(backgroundImage)) { // 如果背景圖片尚未載入完成
    return; // 保留天空藍背景並結束函式
  } // 結束背景圖片載入判斷

  image( // 開始繪製背景圖片
    backgroundImage, // 指定背景圖片
    backgroundX, // 設定背景圖片的水平位置
    backgroundY, // 設定背景圖片的垂直位置
    backgroundWidth, // 設定背景圖片顯示寬度
    backgroundHeight // 設定背景圖片顯示高度
  ); // 結束背景圖片繪製
} // 結束 drawBackground 函式

function getCharacterY(displayHeight) { // 計算角色垂直位置
  const backgroundBottom = backgroundY + backgroundHeight; // 計算縮放後背景圖片的底部位置
  const characterOffset = backgroundHeight * characterBelowBackgroundRatio; // 計算角色位於背景底部下方的距離
  const preferredY = backgroundBottom + characterOffset; // 計算角色預設中心位置
  const minimumY = displayHeight / 2; // 設定角色中心不能超出畫面上方
  const maximumY = height - bottomMargin - displayHeight / 2; // 設定角色中心不能超出畫面底部

  if (maximumY < minimumY) { // 如果角色大於目前畫面可用空間
    return height / 2; // 將角色固定在畫面中央
  } // 結束畫面過小判斷

  return constrain(preferredY, minimumY, maximumY); // 將角色位置限制在有效範圍
} // 結束 getCharacterY 函式

function getMoveSpeed() { // 計算依螢幕大小調整後的移動速度
  return baseMoveSpeed * scaleFactor; // 回傳依比例縮放後的移動速度
} // 結束 getMoveSpeed 函式

function isImageReady(imageObject) { // 檢查圖片是否已經載入完成
  return imageObject && imageObject.width > 0 && imageObject.height > 0; // 回傳圖片是否有效
} // 結束 isImageReady 函式

function getFrameData(sprite, frameCount, frameIndex) { // 計算精靈圖目前動畫格的來源範圍
  const safeFrameIndex = constrain(frameIndex, 0, frameCount - 1); // 將動畫索引限制在有效範圍
  const sourceLeft = floor(safeFrameIndex * sprite.width / frameCount); // 計算動畫格左側來源座標
  const sourceRight = floor((safeFrameIndex + 1) * sprite.width / frameCount); // 計算動畫格右側來源座標
  const sourceWidth = sourceRight - sourceLeft; // 計算動畫格實際來源寬度
  const sourceHeight = sprite.height; // 取得精靈圖原始高度

  return { // 回傳動畫格資料
    sourceLeft: sourceLeft, // 回傳動畫格左側來源座標
    sourceWidth: sourceWidth, // 回傳動畫格來源寬度
    sourceHeight: sourceHeight // 回傳動畫格來源高度
  }; // 結束回傳動畫格資料
} // 結束 getFrameData 函式

function updateAnimation(isMoving, frameCount) { // 更新角色動畫播放狀態
  if (!isMoving) { // 如果角色目前沒有移動
    currentFrame = 0; // 待機時顯示第一格
    frameTimer = 0; // 將動畫播放計時器歸零
    return; // 結束動畫更新
  } // 結束待機狀態判斷

  frameTimer++; // 增加動畫播放計時器

  if (frameTimer >= frameInterval) { // 如果計時器達到切換動畫格的時間
    currentFrame = (currentFrame + 1) % frameCount; // 切換到下一格並循環播放
    frameTimer = 0; // 將動畫播放計時器歸零
  } // 結束動畫格切換判斷
} // 結束 updateAnimation 函式

function drawCharacter(sprite, frameData, displayWidth, displayHeight, facingLeft) { // 繪製角色目前的動畫格
  push(); // 儲存目前畫布的繪圖設定
  translate(characterX, characterY); // 將繪圖原點移動到角色中心位置

  if (facingLeft) { // 如果角色正在向左移動
    scale(-1, 1); // 將角色圖片水平翻轉
  } // 結束水平翻轉判斷

  image( // 開始繪製精靈圖中的單一動畫格
    sprite, // 指定要繪製的精靈圖
    -displayWidth / 2, // 設定動畫格左上角的水平位置
    -displayHeight / 2, // 設定動畫格左上角的垂直位置
    displayWidth, // 設定動畫格顯示寬度
    displayHeight, // 設定動畫格顯示高度
    frameData.sourceLeft, // 設定動畫格在原始圖片中的左側位置
    0, // 設定動畫格在原始圖片中的上側位置
    frameData.sourceWidth, // 設定動畫格原始來源寬度
    frameData.sourceHeight // 設定動畫格原始來源高度
  ); // 結束繪製動畫格

  pop(); // 還原畫布繪圖設定
} // 結束 drawCharacter 函式

function constrainCharacterX(x, displayWidth) { // 限制角色水平位置
  const halfWidth = displayWidth / 2; // 計算角色寬度的一半

  if (width <= displayWidth) { // 如果角色寬度大於或等於畫布寬度
    return width / 2; // 將角色固定在畫布中央
  } // 結束畫布過小判斷

  return constrain(x, halfWidth, width - halfWidth); // 限制角色不能超出左右邊界
} // 結束 constrainCharacterX 函式

function constrainCharacterY(y, displayHeight) { // 限制角色垂直位置
  const halfHeight = displayHeight / 2; // 計算角色高度的一半

  if (height <= displayHeight) { // 如果角色高度大於或等於畫布高度
    return height / 2; // 將角色固定在畫面中央
  } // 結束畫布過小判斷

  return constrain(y, halfHeight, height - bottomMargin - halfHeight); // 限制角色不能超出上下邊界
} // 結束 constrainCharacterY 函式

function windowResized() { // 當瀏覽器視窗大小改變時執行
  const previousHorizontalRatio = characterX / width; // 儲存角色縮放前的水平比例位置

  resizeCanvas(windowWidth, windowHeight); // 將畫布調整為新的視窗大小
  updateLayout(); // 重新計算背景與角色縮放資料

  characterX = width * previousHorizontalRatio; // 依照新畫面寬度恢復角色水平位置
  characterY = getCharacterY(0); // 依照新背景位置重新計算角色垂直位置
} // 結束 windowResized 函式