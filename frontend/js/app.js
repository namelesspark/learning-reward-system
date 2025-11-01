// ==========================================================
// 🚀 Learning Reward System — app.js (Frontend Entry)
// ==========================================================

// ===== 전역 상태 =====
const state = {
  user: null,               // 로그인 유저 {id, points, level, gauge}
  users: [],                // 로컬 저장된 모든 유저 (랭킹용)
  rewardOn: true,           // 퀴즈 ON/OFF
  focus: { filled: 0, level: 1, timer: null, running: false }, // 집중도
};

// ===== 유틸 =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const show = (id) => $$(".view").forEach(v => v.id===id ? v.classList.add("active") : v.classList.remove("active"));
const toast = (msg) => alert(msg);

// ==========================================================
// 🌐 초기화
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Learning Reward System 시작");

  // 서버 헬스 체크
  if (window.checkHealth) {
    const ok = await window.checkHealth();
    console.log(ok ? "✅ 서버 연결 완료" : "⚠️ 서버 응답 없음");
  }

  // 로컬 상태 복원
  restoreState();

  // UI 이벤트 바인딩
  initAuthHandlers();
  initMainHandlers();
  initTopbarHandlers();

  // 초기 진입
  if (state.user) {
    renderMain();
    show("viewMain");
  } else {
    show("viewLogin");
  }
});

// ==========================================================
// 🔐 인증 관련 핸들러
// ==========================================================
function initAuthHandlers() {
  $("#btnGoSignup").onclick = () => show("viewSignup");
  $("#btnBackLogin").onclick = () => show("viewLogin");
  $("#btnBackLoginFromId").onclick = () => show("viewLogin");
  $("#btnBackLoginFromPw").onclick = () => show("viewLogin");

  $("#btnLogin").onclick = doLogin;
  $("#btnSignup").onclick = doSignup;

  $("#btnCheckId").onclick = () => {
    const id = $("#suId").value.trim();
    if (!id) return setHint("#checkIdMsg", "아이디를 입력하세요.", "bad");
    const exists = getUsers().some(u => u.id === id);
    setHint("#checkIdMsg", exists ? "이미 사용 중인 아이디입니다." : "사용 가능한 아이디입니다.", exists ? "bad" : "good");
  };

  $("#suPw2").addEventListener("input", () => {
    const ok = $("#suPw").value === $("#suPw2").value && $("#suPw").value.length >= 4;
    setHint("#pwMatchMsg", ok ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다.", ok ? "good" : "bad");
  });

  $("#btnSendEmail").onclick = () => setHint("#emailVerifyMsg", "인증 메일 전송 (데모)", "good");
  $("#btnVerifyCode").onclick = () => setHint("#emailVerifyMsg", "인증 완료 (데모)", "good");

  $("#btnDoFindId").onclick = () => {
    const email = $("#fiEmail").value.trim();
    setHint("#fiResult", email ? `해당 이메일의 아이디는 demo_user 입니다 (데모)` : "이메일을 입력하세요.", email ? "good" : "bad");
  };
  $("#btnDoFindPw").onclick = () => {
    const id = $("#fpId").value.trim();
    const email = $("#fpEmail").value.trim();
    setHint("#fpResult", (id && email) ? "재설정 메일 전송 (데모)" : "정보를 입력하세요.", (id && email) ? "good" : "bad");
  };
}

// ==========================================================
// 🏠 메인 / 랭킹 / 학습 핸들러
// ==========================================================
function initMainHandlers() {
  $("#btnStartLearn").onclick = () => {
    const url = $("#urlInput").value.trim();
    if (!url) return toast("유튜브 링크를 입력하세요.");
    $("#videoUrl").value = url;
    renderLearnHeader();
    show("viewLearn");
  };

  $("#btnGoRanking").onclick = () => { renderRanking(); show("viewRanking"); };
  $("#btnBackMainFromRank").onclick = () => { renderMain(); show("viewMain"); };

  $("#toggleReward").addEventListener("change", (e) => {
    state.rewardOn = e.target.checked;
    saveState();
    const quizBtn = $("#quizBtn");
    if (!state.rewardOn) quizBtn.disabled = true;
    else if ($("#statusDot").classList.contains("active")) quizBtn.disabled = false;
  });

  $("#btnCam").onclick = toggleCamera;
}

// ==========================================================
// 🔝 상단바 (유저 메뉴)
// ==========================================================
function initTopbarHandlers() {
  $("#btnUserMenu")?.addEventListener("click", () => {
    $(".user-menu").classList.toggle("open");
  });
  document.body.addEventListener("click", (e) => {
    if (!e.target.closest(".user-menu")) $(".user-menu").classList.remove("open");
  });
  $("#btnLogout")?.addEventListener("click", doLogout);
  $("#btnGoHome")?.addEventListener("click", () => {
    if (state.user) { renderMain(); show("viewMain"); }
    else show("viewLogin");
  });
}

// ==========================================================
// ⚙️ 상태 관리
// ==========================================================
function getUsers() {
  try { return JSON.parse(localStorage.getItem("lrs_users") || "[]"); }
  catch { return []; }
}
function setUsers(arr) { localStorage.setItem("lrs_users", JSON.stringify(arr)); }

function restoreState() {
  try {
    const u = JSON.parse(localStorage.getItem("lrs_user") || "null");
    if (u) state.user = u;
    state.rewardOn = (localStorage.getItem("lrs_reward_on") || "1") === "1";
    $("#toggleReward").checked = state.rewardOn;
  } catch {}
}
function saveState() {
  if (state.user) localStorage.setItem("lrs_user", JSON.stringify(state.user));
  localStorage.setItem("lrs_reward_on", state.rewardOn ? "1" : "0");
  $("#navPoints").textContent = state.user?.points ?? 0;
}

// ==========================================================
// 👤 로그인 / 회원가입 / 로그아웃
// ==========================================================
function doLogin() {
  const id = $("#loginId").value.trim();
  const pw = $("#loginPw").value.trim();
  if (!id || !pw) return toast("아이디/비밀번호를 입력하세요.");

  const users = getUsers();
  const found = users.find(u => u.id === id && u.pw === pw);
  if (!found) return toast("아이디 또는 비밀번호가 올바르지 않습니다.");

  state.user = { id: found.id, points: found.points || 0, level: found.level || 1, gauge: found.gauge || 0 };
  saveState();
  renderMain();
  show("viewMain");
}

function doLogout() {
  state.user = null;
  localStorage.removeItem("lrs_user");
  $("#navUserId").textContent = "게스트";
  $("#navPoints").textContent = "0";
  show("viewLogin");
}

function doSignup() {
  const id = $("#suId").value.trim();
  const pw = $("#suPw").value.trim();
  const pw2 = $("#suPw2").value.trim();
  const email = $("#suEmail").value.trim();

  if (!id || !pw || !pw2 || !email) return toast("모든 항목을 입력하세요.");
  if (pw !== pw2) return toast("비밀번호가 일치하지 않습니다.");

  const users = getUsers();
  if (users.some(u => u.id === id)) return toast("이미 사용 중인 아이디입니다.");

  users.push({ id, pw, email, points: 0, level: 1, gauge: 0 });
  setUsers(users);
  toast("회원가입 완료! 로그인 해주세요.");
  show("viewLogin");
}

// ==========================================================
// 🧩 UI 렌더링
// ==========================================================
function setHint(sel, msg, type = "") {
  const el = $(sel);
  el.textContent = msg;
  el.style.color = type === "good" ? "#2e7d32" : (type === "bad" ? "#d32f2f" : "#666");
}

function renderMain() {
  $("#mainUserId").textContent = state.user.id;
  $("#mainPoints").textContent = state.user.points ?? 0;
  $("#navUserId").textContent = state.user.id;
  $("#navPoints").textContent = state.user.points ?? 0;
}

function renderRanking() {
  const users = getUsers().map(u => ({ id: u.id, points: u.points || 0 }));
  if (!users.find(u => u.id === state.user.id)) users.push({ id: state.user.id, points: state.user.points || 0 });

  users.sort((a, b) => b.points - a.points);
  const myIndex = users.findIndex(u => u.id === state.user.id);
  $("#myRank").textContent = myIndex + 1;
  $("#myScore").textContent = state.user.points ?? 0;

  const tbody = $("#rankTable tbody");
  tbody.innerHTML = "";
  users.forEach((u, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i + 1}</td><td>${u.id}</td><td>${u.points}</td>`;
    tbody.appendChild(tr);
  });
}

function renderLearnHeader() {
  $("#totalPoints").textContent = state.user.points ?? 0;
  $("#currentStreak").textContent = 0;
}

// ==========================================================
// 🎥 집중도 (카메라 + 타이머)
// ==========================================================
async function toggleCamera() {
  const vid = $("#camView");
  if (state.focus.running) {
    stopFocusTimer();
    if (vid.srcObject) {
      vid.srcObject.getTracks().forEach(t => t.stop());
      vid.srcObject = null;
    }
    vid.style.display = "none";
    $("#btnCam").textContent = "카메라 켜기";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    vid.srcObject = stream;
    vid.style.display = "block";
  } catch {
    console.warn("🎥 카메라 접근 실패 (권한 거부)");
  }

  startFocusTimer();
  $("#btnCam").textContent = "카메라 끄기";
}

function startFocusTimer() {
  state.focus.running = true;
  if (state.focus.timer) clearInterval(state.focus.timer);
  const unitSec = 12; // 데모용 (실제는 12분 => *60)
  let sec = 0;
  state.focus.timer = setInterval(() => {
    if (document.hidden) return;
    sec++;
    if (sec >= unitSec) {
      sec = 0;
      incGauge();
    }
  }, 1000);
}

function stopFocusTimer() {
  state.focus.running = false;
  if (state.focus.timer) clearInterval(state.focus.timer);
  state.focus.timer = null;
}

function incGauge() {
  const gauge = $("#focusGauge");
  let filled = Number(gauge.style.getPropertyValue("--filled") || 0);
  filled = Math.min(5, filled + 1);
  gauge.style.setProperty("--filled", filled);
  if (filled >= 5) {
    gauge.style.setProperty("--filled", 0);
    const lvEl = $("#focusLevel");
    let lv = Number(lvEl.textContent || 1);
    lvEl.textContent = (lv + 1).toString();
  }
}

// ==========================================================
// 🏅 점수 관리
// ==========================================================
function addPoint(delta = 1) {
  state.user.points = (state.user.points || 0) + delta;
  $("#totalPoints").textContent = state.user.points;
  $("#navPoints").textContent = state.user.points;
  $("#mainPoints").textContent = state.user.points;
  saveState();

  const users = getUsers();
  const idx = users.findIndex(u => u.id === state.user.id);
  if (idx >= 0) { users[idx].points = state.user.points; setUsers(users); }
}

// 외부 호출 허용 (quiz.js 등)
window.__frontendAddPoint = addPoint;
window.__frontendRewardOn = () => state.rewardOn;
