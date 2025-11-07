import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getUserScore, addUserScore } from './score.js';

// -------------------- 초기 설정 --------------------
const API_URL = 'http://172.25.109.44:5000';
let uid = null;

const url = localStorage.getItem('videoURL');
if (!url) {
  alert('먼저 강의를 로드하세요');
  window.location.href = 'lecture.html';
}

let videoId;
try {
  videoId = new URL(url).searchParams.get('v');
} catch {
  alert('잘못된 영상 URL입니다.');
  window.location.href = 'lecture.html';
}

document.getElementById('lectureFrame').src = `https://www.youtube.com/embed/${videoId}`;

const chatBox = document.getElementById('chatBox');
const input = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');


const quizModal = document.getElementById('quizModal');
const closeQuizBtn = document.getElementById('closeQuiz');
const quizToggle = document.getElementById('quizToggle');
const quizConfirm = document.getElementById('quizConfirm');
const quizSubmit = document.getElementById('quizSubmit');
const quizCountInput = document.getElementById('quizCount');
const quizContainer = document.getElementById('quizContainer');




// 퀴즈 수 직접 선택 버튼
quizConfirm.addEventListener('click', async () => {
  if (!quizToggle.checked) {
    // 토글이 꺼져 있으면 퀴즈 출제 차단 및 알림
    alert('퀴즈 체크 박스를 확인하세요.');
    displayQuizzes([]);  // 빈 배열 전달해서 퀴즈 표시 초기화
    return;
  }
  const num = parseInt(quizCountInput.value);
  const quizzes = await generateQuiz(num);

  // API 오류나 빈 배열일 때도 모달 뜨게 보장
  displayQuizzes(quizzes);
});

// 퀴즈 생성
async function generateQuiz(num) {
  try {
    const uid = localStorage.getItem('userId') || 'guest';
    const videoId = localStorage.getItem('videoId');
    const res = await fetch(`${API_URL}/api/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ user_id: uid, video_id: videoId, num_quizzes: num})
    });
    const data = await res.json();
    if (data.success) return data.quizzes;
    throw new Error(data.error);
  } catch (e) {
    alert('퀴즈 생성 실패: ' + e.message);
    return [];
  }
}

// 퀴즈 표시
function displayQuizzes(quizzes) {
  const container = document.getElementById('quizContainer');
  container.innerHTML = '';

  // 퀴즈 없을 때 안내 메시지
  if (!quizzes || quizzes.length === 0) {
    container.innerHTML = '<p>퀴즈를 불러올 수 없습니다. 다시 시도해주세요.</p>';
    openQuizModal();
    return;
  }

  quizzes.forEach((q, i) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${i + 1}. ${q.question}</h3>
      <ul>
        ${q.options
          .map(
            (opt, idx) =>
              `<li><label><input type="radio" name="q${i}" value="${idx}"> ${opt}</label></li>`
          )
          .join('')}
      </ul>
    `;
    container.appendChild(div);
  });

  openQuizModal();
}

// -------------------- API 호출 함수 --------------------
async function handleChat() {
  const message = input.value.trim();
  if (!message) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'msg user';
  userMsg.textContent = message;
  chatBox.appendChild(userMsg);

  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: uid, message })
    });
    const data = await res.json();

    const botMsg = document.createElement('div');
    botMsg.className = 'msg bot';
    botMsg.textContent = data.success ? data.response : '채팅 실패';
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch {
    const botMsg = document.createElement('div');
    botMsg.className = 'msg bot';
    botMsg.textContent = '서버 오류로 응답을 불러올 수 없습니다.';
    chatBox.appendChild(botMsg);
  }
}

// -------------------- 이벤트 등록 --------------------
// 로그인 후 점수 표시
onAuthStateChanged(window.auth, async (user) => {
  if (!user) return (window.location.href = 'index.html');
  uid = user.uid;
  document.getElementById('userName').textContent = user.displayName || '사용자';
  document.getElementById('userScore').textContent = await getUserScore(uid);
});
// Enter 입력 및 전송 버튼
input.addEventListener('keydown', e => e.key === 'Enter' && handleChat());
sendBtn.addEventListener('click', handleChat);
// 로그아웃 & 뒤로가기
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await window.auth.signOut();
  alert('로그아웃 되었습니다.');
  window.location.href = 'index.html';
});
document.getElementById('quizToggle').addEventListener('change', () => {
  alert('퀴즈가 출제되지 않습니다!');
});
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});
function openQuizModal() {
  quizModal.classList.add('active');
  quizModal.classList.remove('hidden');
}
function closeQuizModal() {
  quizModal.classList.remove('active');
  quizModal.classList.add('hidden');
}
// 닫기 버튼 클릭
closeQuizBtn.addEventListener('click', closeQuizModal);
// 바깥 클릭 시 닫기
window.addEventListener('click', (e) => {
  if (e.target === quizModal) closeQuizModal();
});
// ESC로 닫기
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeQuizModal();
});