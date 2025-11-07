
import { getUserScore, addUserScore, setUserScore } from './score.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// ================================
// ✅ 로그인 상태 확인 및 정보 표시
// ================================
onAuthStateChanged(window.auth, async (user) => {
  if (user) {
    document.getElementById('userName').textContent = user.displayName || user.email;

  // Firestore에서 점수 불러오기
  // 통합 점수 모듈로 점수 불러오기
    const score = await getUserScore(user.uid);
    document.getElementById('userScore').textContent = score;

  } else {
    // 로그인 안 된 상태면 로그인 페이지로 이동
    window.location.href = 'login.html';
  }
});

// ================================
// 👤 로그아웃 버튼 표시/숨김
// ================================
const userBtn = document.getElementById('userBtn');
const logoutBox = document.getElementById('logoutBox');
const logoutBtn = document.getElementById('logoutBtn');

userBtn.addEventListener('click', () => {
  logoutBox.classList.toggle('hidden');
});

logoutBtn.addEventListener('click', async () => {
  await signOut(window.auth);
  alert('로그아웃 되었습니다.');
  window.location.href = 'index.html';
});

// ================================
// 🧭 메뉴 이동 함수
// ================================
window.goToRanking = () => {
  window.location.href = 'ranking.html';
};

window.goToLecture = () => {
  window.location.href = 'lecture.html';
};

window.goToStore = () => {
  window.location.href = 'store.html';
};
