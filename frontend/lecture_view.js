import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getUserScore, addUserScore } from "./score.js";

let uid = null;

// ✅ 로그인 후 사용자 정보 + 점수 불러오기
onAuthStateChanged(window.auth, async (user) => {
  if (!user) return (window.location.href = "login.html");
  uid = user.uid;
  document.getElementById("userName").textContent = user.displayName || user.email;

  const score = await getUserScore(uid);
  document.getElementById("userScore").textContent = score;

  loadVideo();
});

// ✅ localStorage에서 URL 불러오기
function loadVideo() {
  const url = localStorage.getItem("videoURL");
  if (!url) {
    alert("영상 URL 정보가 없습니다. 다시 선택해주세요.");
    window.location.href = "lecture.html";
    return;
  }

  try {
    const videoId = new URL(url).searchParams.get("v");
    if (!videoId) throw new Error("유효하지 않은 영상입니다.");

    document.getElementById("lectureFrame").src =
      `https://www.youtube.com/embed/${videoId}`;
  } catch {
    alert("유효한 유튜브 링크가 아닙니다.");
    window.location.href = "lecture.html";
  }
}

// ✅ 챗봇/퀴즈 기능
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const quizToggle = document.getElementById("quizToggle");

sendBtn.addEventListener("click", handleChat);
input.addEventListener("keydown", (e) => e.key === "Enter" && handleChat());

function append(role, text) {
  const msg = document.createElement("div");
  msg.className = `msg ${role}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

let waitingAnswer = null;

async function handleChat() {
  const text = input.value.trim();
  if (!text) return;
  append("user", text);
  input.value = "";

  if (!quizToggle.checked) {
    append("bot", "퀴즈 모드는 꺼져 있습니다.");
    return;
  }

  // 퀴즈 생성
  const quiz = generateQuiz();
  append("bot", quiz.q);

  waitingAnswer = async (answer) => {
    if (answer.toLowerCase() === quiz.a) {
      append("bot", "✅ 정답! +10점!");
      await addUserScore(uid, 10);
      const score = await getUserScore(uid);
      document.getElementById("userScore").textContent = score;
    } else {
      append("bot", `❌ 오답입니다. 정답은 "${quiz.a}"`);
    }
    waitingAnswer = null;
  };
}

// 간단한 랜덤 퀴즈 예시
function generateQuiz() {
  const data = [
    { q: "HTML의 약자는?", a: "html" },
    { q: "Python의 철자는?", a: "python" },
    { q: "AI의 약자는?", a: "ai" },
  ];
  return data[Math.floor(Math.random() * data.length)];
}
