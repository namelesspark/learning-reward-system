import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getUserScore, addUserScore } from './score.js';

// URL 로드
// ✅ [기존 블록 전체 교체: URL 로드 + 유효성 검사 + iframe 세팅]
const url = localStorage.getItem('videoURL');
if (!url) window.location.href = 'lecture.html';

let videoId = null;
try {
  videoId = new URL(url).searchParams.get('v');
} catch {
  alert('잘못된 영상 URL입니다.');
  window.location.href = 'lecture.html';
}
if (!videoId) {
  alert('유효한 영상 링크가 아닙니다.');
  window.location.href = 'lecture.html';
}
document.getElementById('lectureFrame').src = `https://www.youtube.com/embed/${videoId}`;


const chatBox = document.getElementById('chatBox');
const input = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const quizToggle = document.getElementById('quizToggle');

let uid = null;

// 로그인 후 점수 표시
onAuthStateChanged(window.auth, async (user) => {
  if (!user) return (window.location.href = 'login.html');
  uid = user.uid;
  const score = await getUserScore(uid);
  document.getElementById('userScore').textContent = score;
});

// 메시지 출력
function append(role, text) {
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 간단 퀴즈 생성기(예시)
function makeQuiz() {
  const qList = [
    { q: 'AI의 약자는?', a: 'ai' },
    { q: 'HTML의 철자는?', a: 'html' },
    { q: 'Python의 철자는?', a: 'python' },
  ];
  return qList[Math.floor(Math.random() * qList.length)];
}


let waitingAnswer = null; // 현재 진행 중인 퀴즈 핸들러 보호

async function handleSend() {
  const text = input.value.trim();
  if (!text) return;
  append('user', text);
  input.value = '';

  // 퀴즈 OFF → 단순 응답 자리만
  if (!quizToggle.checked) {
    return setTimeout(() => append('bot', `(퀴즈 OFF) "${text}"에 대해 더 공부해볼까요?`), 400);
  }

  // 이미 퀴즈 대기 중이면 무시
  if (waitingAnswer) return;

  // 퀴즈 출제
  const quiz = makeQuiz();
  append('bot', `🧩 퀴즈: ${quiz.q}`);
  waitingAnswer = async (answer) => {
    if (!uid) return;
    if (answer.toLowerCase() === quiz.a) {
    append('bot', '✅ 정답! +10점');
    // ✅ UI 즉시 반영
    const current = Number(document.getElementById('userScore').textContent) || 0;
    document.getElementById('userScore').textContent = current + 10;
    // Firestore 반영
    await addUserScore(uid, +10);
    } else {
    append('bot', `❌ 오답! 정답은 "${quiz.a}"`);
    }
    // (선택) 서버 최신값 확인하려면 유지
    const newScore = await getUserScore(uid);
    document.getElementById('userScore').textContent = newScore;
    waitingAnswer = null;

  };
}

// 다음 입력을 정답으로 처리
input.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter' || !waitingAnswer) return;
  const ans = input.value.trim();
  if (!ans) return;
  append('user', ans);
  input.value = '';
  await waitingAnswer(ans);
});
// ✅ [sendBtn 클릭 리스너 단일화 — 기존 두 개 삭제하고 이걸로 교체]
sendBtn.addEventListener('click', async () => {
  if (waitingAnswer) {
    // 정답 입력 처리
    const ans = input.value.trim();
    if (!ans) return;
    append('user', ans);
    input.value = '';
    await waitingAnswer(ans);
  } else {
    // 일반 질문 → handleSend로 퀴즈 출제/응답
    handleSend();
  }
});


// ✅ [파일 맨 아래에 추가]

// 로그아웃
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await window.auth.signOut();
  alert('로그아웃 되었습니다.');
  window.location.href = 'login.html';
});

// 이전으로 가기
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

