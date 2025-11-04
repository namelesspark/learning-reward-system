import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ 로그인 확인
onAuthStateChanged(window.auth, async (user) => {
  if (!user) return (window.location.href = "login.html");

  document.getElementById("userName").textContent = user.displayName || user.email;
  const snap = await getDoc(doc(window.db, "users", user.uid));
  if (snap.exists()) {
    document.getElementById("userScore").textContent = snap.data().totalScore ?? 0;
  }
});

// ✅ 영상 로드 버튼 클릭 시 URL 저장 후 이동
document.getElementById("loadBtn").addEventListener("click", () => {
  const url = document.getElementById("videoUrl").value.trim();
  if (!url) return alert("URL을 입력하세요");

  try {
    // URL 검증 (유효한 YouTube 링크인지)
    const videoId = new URL(url).searchParams.get("v");
    if (!videoId) throw new Error("유효하지 않은 링크입니다.");

    localStorage.setItem("videoURL", url);
    console.log("✅ URL 저장 완료:", url);
    window.location.href = "lecture_view.html";
  } catch (err) {
    alert("유효한 YouTube 영상 링크를 입력하세요.");
  }
});
