import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let currentUser = null;
let userScore = 0;
let refreshInterval = null; // ⏰ 5분 자동 갱신 타이머

// =======================================
// 🔑 로그인 확인 및 사용자 정보 불러오기
// =======================================
onAuthStateChanged(window.auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  document.getElementById('userName').textContent = user.displayName || user.email;

  const userRef = doc(window.db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    userScore = data.totalScore ?? 0;
    document.getElementById('userScore').textContent = userScore;
    document.getElementById('myId').textContent = user.displayName || user.email;
    document.getElementById('myScore').textContent = userScore;
  }

  await loadRanking();   // 초기 1회 로드
  startAutoRefresh();    // 이후 5분 간격 자동 갱신
});


// =======================================
// 🏆 전체 랭킹 불러오기 (빈 결과 대비 강화)
// =======================================
async function loadRanking() {
  const q = query(collection(window.db, 'users'), orderBy('totalScore', 'desc'));
  const snapshot = await getDocs(q);

  const rankingContainer = document.getElementById('rankingContainer');
  rankingContainer.innerHTML = '';

  // 🔒 빈 컬렉션/문서 대비
  if (snapshot.empty) {
    rankingContainer.innerHTML =
      '<p style="text-align:center; color:#666;">등록된 사용자가 없습니다.</p>';
    document.getElementById('myRank').textContent = '순위가 매겨지지 않았습니다.';
    // 최근 갱신 시간도 업데이트
    const now = new Date().toLocaleTimeString();
    document.getElementById('lastUpdateText').textContent = `최근 갱신: ${now}`;
    console.log(`[Ranking] 갱신 완료 (빈 목록) ${now}`);
    return;
  }

  let rank = 1;
  let myRank = null;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const item = document.createElement('div');
    item.className = 'rank-item';
    item.innerHTML = `
      <div><strong>${rank}위</strong> ${data.displayName || data.email}</div>
      <div>${data.totalScore ?? 0} 점</div>
    `;
    rankingContainer.appendChild(item);

    // 내 순위/점수 동기화
    if (docSnap.id === currentUser?.uid) {
      myRank = rank;
      document.getElementById('myScore').textContent = data.totalScore ?? 0;
      document.getElementById('userScore').textContent = data.totalScore ?? 0;
    }

    rank++;
  });

  document.getElementById('myRank').textContent = myRank ?? '-';

  // 최근 갱신 시간 표시
  const now = new Date().toLocaleTimeString();
  document.getElementById('lastUpdateText').textContent = `최근 갱신: ${now}`;
  console.log(`[Ranking] 갱신 완료 (${now})`);
}


// =======================================
// ⏰ 5분(300초) 간격 자동 갱신
// =======================================
function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(loadRanking, 300000); // 300000ms = 5분
}

// =======================================
// 🔄 수동 새로고침 버튼
// =======================================
document.getElementById('refreshBtn').addEventListener('click', async () => {
  const btn = document.getElementById('refreshBtn');
  btn.disabled = true;
  const prev = btn.textContent;
  btn.textContent = '⏳ 갱신 중...';
  try {
    await loadRanking();
  } finally {
    btn.textContent = prev;
    btn.disabled = false;
  }
});

// =======================================
// 👤 로그아웃
// =======================================
const userBtn = document.getElementById('userBtn');
const logoutBox = document.getElementById('logoutBox');
const logoutBtn = document.getElementById('logoutBtn');

userBtn.addEventListener('click', () => {
  logoutBox.classList.toggle('hidden');
});

logoutBtn.addEventListener('click', async () => {
  if (refreshInterval) clearInterval(refreshInterval);
  await signOut(window.auth);
  alert('로그아웃 되었습니다.');
  window.location.href = 'login.html';
});

// =======================================
// ⬅️ 이전으로 가기
// =======================================
document.getElementById('backBtn').addEventListener('click', () => {
  if (refreshInterval) clearInterval(refreshInterval);
  window.location.href = 'dashboard.html';
});
