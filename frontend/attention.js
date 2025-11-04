// attention.js — 프론트엔드용 Teachable Machine 집중도 감지 코드
import * as tmImage from "https://teachablemachine.withgoogle.com/tfjs-image.min.js";

let model, webcam, labelContainer, maxPredictions;

async function init() {
 @바꿔야할 부분 모델 주소 const modelURL = "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_URL/model.json";
 @바꿔야할 부분 모델 주소 const metadataURL = "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_URL/metadata.json";

  // 모델 로드
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // 웹캠 초기화
  const flip = true;
  webcam = new tmImage.Webcam(300, 200, flip); // width, height, flip
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  // HTML 표시 영역
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction = `${prediction[i].className}: ${(
      prediction[i].probability * 100
    ).toFixed(1)}%`;
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }

  // ✅ 예: “집중” 확률이 80% 이상이면 학습 집중 중으로 판단
  const focused = prediction.find((p) => p.className === "Focused");
  if (focused && focused.probability > 0.8) {
    document.getElementById("status").textContent = "🟢 집중 중!";
  } else {
    document.getElementById("status").textContent = "🔴 집중 안 함";
  }
}

// 페이지 로드시 자동 실행
window.addEventListener("load", init);
