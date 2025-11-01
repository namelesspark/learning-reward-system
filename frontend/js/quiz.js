// ==========================================================
// 🧠 quiz.js — 학습 퀴즈 생성 / 제출 / 결과 표시 (Final)
// ==========================================================

// 현재 퀴즈 상태
let currentQuiz = null;
let selectedAnswer = null;

// ==========================================================
// 🎯 퀴즈 생성
// ==========================================================
async function generateQuiz() {
  // 학습 리워드 OFF 시 차단
  if (typeof window.__frontendRewardOn === "function" && !window.__frontendRewardOn()) {
    alert("학습 리워드가 OFF 상태입니다. 설정에서 켜주세요.");
    return;
  }

  var quizBtn = document.getElementById("quizBtn");
  if (quizBtn) {
    quizBtn.disabled = true;
    quizBtn.textContent = "⏳ 퀴즈 생성 중...";
  }

  try {
    // 백엔드 세션 기반으로 자막 사용 (프론트에서 transcript 전달 생략)
    var data = await generateQuizAPI("");

    if (data && data.success) {
      currentQuiz = data.quiz;
      showQuizModal(currentQuiz);

      if (quizBtn) {
        quizBtn.textContent = "❓ 퀴즈 생성하기";
        quizBtn.disabled = false;
      }

      // 파란 말풍선으로 퀴즈 안내 메시지 (선택)
      if (typeof addChatMessage === "function") {
        addChatMessage("quiz", "🧩 퀴즈가 생성되었습니다. 문제를 풀어보세요!");
      }
    } else {
      throw new Error((data && data.error) || "퀴즈 생성 실패");
    }
  } catch (err) {
    alert("퀴즈 생성 실패: " + (err && err.message ? err.message : String(err)));
    if (quizBtn) {
      quizBtn.textContent = "❓ 퀴즈 생성하기";
      quizBtn.disabled = false;
    }
  }
}

// ==========================================================
// 📝 퀴즈 모달 표시
// ==========================================================
function showQuizModal(quiz) {
  var modal = document.getElementById("quizModal");
  var q = document.getElementById("quizQuestion");
  var opts = document.getElementById("quizOptions");

  if (q) q.textContent = (quiz && quiz.question) ? quiz.question : "문제가 없습니다.";
  if (opts) {
    opts.innerHTML = "";
    var options = (quiz && quiz.options) ? quiz.options : [];
    for (var i = 0; i < options.length; i++) {
      var d = document.createElement("div");
      d.className = "quiz-option";
      d.textContent = options[i];
      (function (idx) {
        d.onclick = function () { selectOption(idx); };
      })(i);
      opts.appendChild(d);
    }
  }

  selectedAnswer = null;
  var submitBtn = document.getElementById("submitQuizBtn");
  if (submitBtn) submitBtn.disabled = true;
  if (modal) modal.classList.add("show");
}

// ==========================================================
// ✅ 선택지 클릭
// ==========================================================
function selectOption(index) {
  var all = document.querySelectorAll(".quiz-option");
  for (var i = 0; i < all.length; i++) {
    all[i].classList.remove("selected");
  }
  var target = document.querySelectorAll(".quiz-option")[index];
  if (target) target.classList.add("selected");

  selectedAnswer = index;

  var submitBtn = document.getElementById("submitQuizBtn");
  if (submitBtn) submitBtn.disabled = false;
}

// ==========================================================
// 📤 퀴즈 제출
// ==========================================================
async function submitQuiz() {
  if (selectedAnswer === null) {
    alert("답을 선택하세요.");
    return;
  }

  var btn = document.getElementById("submitQuizBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "채점 중...";
  }

  try {
    var correct = currentQuiz && typeof currentQuiz.correct_answer !== "undefined"
      ? currentQuiz.correct_answer
      : null;

    var data = await submitQuizAPI(selectedAnswer, correct);

    if (data && data.success) {
      closeQuiz();
      showResultModal(data, currentQuiz);
      updateProgress(data.user_progress);

      // 정답일 때 1점 추가 (프론트 상태/랭킹 업데이트)
      if (data.is_correct && typeof window.__frontendAddPoint === "function") {
        window.__frontendAddPoint(1);
      }
    } else {
      throw new Error((data && data.error) || "채점 실패");
    }
  } catch (err) {
    alert("퀴즈 제출 실패: " + (err && err.message ? err.message : String(err)));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "제출하기";
    }
  }
}

// ==========================================================
// 📊 진행 상황 갱신
// ==========================================================
function updateProgress(progress) {
  if (!progress) return;
  var p = document.getElementById("totalPoints");
  var s = document.getElementById("currentStreak");
  if (p) p.textContent = (typeof progress.points === "number" ? progress.points : 0);
  if (s) s.textContent = (typeof progress.streak === "number" ? progress.streak : 0);
}

// ==========================================================
// 🧾 결과 모달 표시
// ==========================================================
function showResultModal(result, quiz) {
  var modal = document.getElementById("resultModal");
  var header = document.getElementById("resultHeader");
  var title = document.getElementById("resultTitle");
  var msg = document.getElementById("resultMessage");
  var exp = document.getElementById("resultExplanation");
  var rewardInfo = document.getElementById("rewardInfo");

  var isCorrect = !!(result && result.is_correct);

  if (header) header.className = "result-header " + (isCorrect ? "correct" : "incorrect");
  if (title) title.textContent = isCorrect ? "🎉 정답입니다!" : "😅 아쉽네요!";
  if (msg) msg.textContent = isCorrect ? "훌륭해요! 강의 내용을 잘 이해하셨네요." : "다시 한번 복습해보세요.";

  var explanation = (quiz && quiz.explanation) ? quiz.explanation : "해설이 없습니다.";
  if (exp) exp.innerHTML = "<strong>💡 해설:</strong><br>" + explanation;

  var streakVal = (result && result.reward && typeof result.reward.streak !== "undefined")
    ? result.reward.streak
    : "-";
  var pointText = isCorrect ? "+1" : "+0";

  if (rewardInfo) {
    rewardInfo.innerHTML = ''
      + '<div class="reward-item">'
      + '  <div class="reward-label">획득 포인트</div>'
      + '  <div class="reward-value">' + pointText + '</div>'
      + '</div>'
      + '<div class="reward-item">'
      + '  <div class="reward-label">연속 정답</div>'
      + '  <div class="reward-value">' + streakVal + '</div>'
      + '</div>';
  }

  if (modal) modal.classList.add("show");
}

// ==========================================================
// 🧹 모달 닫기
// ==========================================================
function closeQuiz() {
  var modal = document.getElementById("quizModal");
  if (modal) modal.classList.remove("show");
  selectedAnswer = null;
}

function closeResult() {
  var modal = document.getElementById("resultModal");
  if (modal) modal.classList.remove("show");
}

// ==========================================================
// 🖱️ 모달 외부 클릭 시 닫기
// ==========================================================
window.addEventListener("click", function (event) {
  var quizModal = document.getElementById("quizModal");
  var resultModal = document.getElementById("resultModal");
  if (event.target === quizModal) closeQuiz();
  if (event.target === resultModal) closeResult();
});

// ==========================================================
// 🌍 전역 바인딩 (HTML 인라인 핸들러 대응)
// ==========================================================
window.generateQuiz = generateQuiz;
window.submitQuiz = submitQuiz;
window.closeQuiz = closeQuiz;
window.closeResult = closeResult;
