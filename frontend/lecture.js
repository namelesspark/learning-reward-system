import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

onAuthStateChanged(window.auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('userName').textContent = user.displayName || user.email;

  const snap = await getDoc(doc(window.db, 'users', user.uid));
  if (snap.exists()) {
    document.getElementById('userScore').textContent = snap.data().totalScore ?? 0;
  }
});

document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(window.auth);
  alert('로그아웃 되었습니다.');
  window.location.href = 'login.html';
});

// 영상 로드 버튼
document.getElementById('loadBtn').addEventListener('click', () => {
  const url = document.getElementById('videoUrl').value.trim();
  if (!url) return alert('URL을 입력하세요');
  localStorage.setItem('videoURL', url);
  window.location.href = 'lecture_view.html';
});


