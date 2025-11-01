// ==========================================================
// 💬 chatbot.js — 학습 도우미 챗봇 UI 로직
//  - 전역: sendMessage, addChatMessage, removeMessage
//  - 의존: api.js (window.sendChatMessage), style.css/components.css
// ==========================================================

// ------------------------------
// 유틸: XSS 방지용 간단 이스케이프
// ------------------------------
function escapeHTML(html) {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

// 필요 시 줄바꿈/간단 마크업만 허용하고 싶다면 여기서 변환
function renderContent(raw) {
  // 기본은 안전하게 이스케이프 + \n → <br>
  return escapeHTML(raw).replace(/\n/g, "<br>");
}

// ------------------------------
// 메시지 전송
// ------------------------------
async function sendMessage() {
  const input = document.getElementById("userInput");
  if (!input) return;

  const message = input.value.trim();
  if (!message) return;

  // 사용자 메시지 표시 (초록 말풍선)
  addChatMessage("user", renderContent(message));
  input.value = "";

  // 로딩 메시지 표시
  const loadingId = addChatMessage(
    "assistant",
    '<div class="loading-dots"><span></span><span></span><span></span></div>',
    true
  );

  try {
    // api.js의 window.sendChatMessage 사용
    const data = await window.sendChatMessage(message);

    // 로딩 제거
    removeMessage(loadingId);

    if (data && data.success) {
      // 어시스턴트 응답 표시 (흰 말풍선)
      addChatMessage("assistant", renderContent(data.response || " "));
    } else {
      addChatMessage("assistant", "오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  } catch (error) {
    removeMessage(loadingId);
    addChatMessage("assistant", "오류가 발생했습니다: " + escapeHTML(error.message || "알 수 없는 오류"));
  }
}

// ------------------------------
// 채팅 메시지 추가 (user / assistant / quiz 지원)
//  - isLoading=true 이면 .loading 클래스가 붙고, 스타일이 로딩용으로 표시됨
// ------------------------------
function addChatMessage(role, content, isLoading = false) {
  const messagesDiv = document.getElementById("chatMessages");
  if (!messagesDiv) return null;

  const messageId = "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2);
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;
  messageDiv.id = messageId;
  if (isLoading) messageDiv.classList.add("loading");

  messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
  messagesDiv.appendChild(messageDiv);

  // 스크롤 맨 아래로
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return messageId;
}

// ------------------------------
// 채팅 메시지 제거
// ------------------------------
function removeMessage(messageId) {
  if (!messageId) return;
  const el = document.getElementById(messageId);
  if (el) el.remove();
}

// ------------------------------
// 엔터키 전송 (input에 onkeypress가 이미 있으면 생략 가능)
// ------------------------------
(function attachEnterHandler() {
  const input = document.getElementById("userInput");
  if (!input) return;
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
})();

// ------------------------------
// 전역 바인딩 (다른 스크립트/인라인 핸들러에서 사용 가능)
// ------------------------------
window.sendMessage = sendMessage;
window.addChatMessage = addChatMessage;
window.removeMessage = removeMessage;
