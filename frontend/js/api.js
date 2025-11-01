// ==========================================================
// 🌐 api.js — Learning Reward System (Whisper + Quiz + Chatbot)
// ==========================================================

// 백엔드 주소 (필요 시 윗줄만 바꾸면 됨)
const API_URL = window.API_BASE || "http://127.0.0.1:5000";
const SESSION_ID = "user_" + Date.now();

// ------------------------------
// 공통 API 호출 도우미
// ------------------------------
async function apiCall(endpoint, method = "GET", body = null) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" }
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, opts);
  let data = null;

  // 응답이 JSON이 아닐 수도 있어 방어적으로 처리
  try {
    data = await res.json();
  } catch (_) {
    // noop
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || "API 요청 실패";
    throw new Error(msg);
  }

  return data ?? {};
}

// ------------------------------
// 헬스 체크
// ------------------------------
async function checkHealth() {
  try {
    const data = await apiCall("/api/health");
    console.log("✅ Server is running:", data);
    return true;
  } catch (err) {
    console.error("❌ Server is not responding:", err.message);
    return false;
  }
}

// ------------------------------
// 유튜브 STT (Whisper)
// ------------------------------
async function loadVideoAPI(videoUrl) {
  // 백엔드: POST /stt { url, session_id }
  const res = await apiCall("/stt", "POST", {
    url: videoUrl,
    session_id: SESSION_ID
  });

  // 백엔드 표준 응답: { success, text, segments }
  if (res && res.success === false) {
    throw new Error(res.error || "STT 서버 요청 실패");
  }

  return {
    success: true,
    video_info: {
      embed_url: makeEmbedUrl(videoUrl),
      text: res.text || "",
      segments: res.segments || []
    }
  };
}

// 유튜브 URL을 embed URL로 변환 (여러 형태 방어)
function makeEmbedUrl(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m && m[1]) {
      return `https://www.youtube.com/embed/${m[1]}`;
    }
  }
  // 비상: v= 파라미터 파싱
  const id = url.split("v=")[1]?.split("&")[0];
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

// ------------------------------
// 챗봇 Q&A
// ------------------------------
async function sendChatMessage(message) {
  // 백엔드: POST /chat { message, session_id }
  return await apiCall("/chat", "POST", {
    message,
    session_id: SESSION_ID
  });
}

// ------------------------------
// 퀴즈 생성
// ------------------------------
async function generateQuizAPI(transcript = "") {
  // 백엔드: POST /quiz { transcript?, session_id }
  return await apiCall("/quiz", "POST", {
    transcript,
    session_id: SESSION_ID
  });
}

// ------------------------------
// 퀴즈 제출(채점)
// ------------------------------
async function submitQuizAPI(answer, correctAnswer) {
  // 백엔드: POST /quiz/submit { answer, correct_answer, session_id }
  return await apiCall("/quiz/submit", "POST", {
    answer,
    correct_answer: correctAnswer,
    session_id: SESSION_ID
  });
}

// ------------------------------
// 진행도 조회
// ------------------------------
async function getProgress() {
  // 백엔드: GET /progress?session_id=...
  return await apiCall(`/progress?session_id=${SESSION_ID}`, "GET");
}

// ------------------------------
// 전역 바인딩 (script 태그 로드 순서 대응)
// ------------------------------
window.checkHealth = checkHealth;
window.loadVideoAPI = loadVideoAPI;
window.sendChatMessage = sendChatMessage;
window.generateQuizAPI = generateQuizAPI;
window.submitQuizAPI = submitQuizAPI;
window.getProgress = getProgress;
