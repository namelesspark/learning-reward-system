let currentQuiz = null;
let selectedAnswer = null;

// 퀴즈 생성
async function generateQuiz() {
    const quizBtn = document.getElementById('quizBtn');
    quizBtn.disabled = true;
    quizBtn.textContent = '⏳ 퀴즈 생성 중...';

    try {
        const data = await generateQuizAPI();

        if (data.success) {
            currentQuiz = data.quiz;
            showQuizModal(currentQuiz);
            quizBtn.textContent = '❓ 퀴즈 생성하기';
            quizBtn.disabled = false;
        }
    } catch (error) {
        alert('퀴즈 생성 실패: ' + error.message);
        quizBtn.textContent = '❓ 퀴즈 생성하기';
        quizBtn.disabled = false;
    }
}

// 퀴즈 모달 표시
function showQuizModal(quiz) {
    const modal = document.getElementById('quizModal');
    const questionDiv = document.getElementById('quizQuestion');
    const optionsDiv = document.getElementById('quizOptions');

    // 질문 표시
    questionDiv.textContent = quiz.question;

    // 선택지 표시
    optionsDiv.innerHTML = '';
    quiz.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectOption(index);
        optionsDiv.appendChild(optionDiv);
    });

    selectedAnswer = null;
    modal.classList.add('show');
}

// 선택지 선택
function selectOption(index) {
    // 이전 선택 제거
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // 새 선택 표시
    document.querySelectorAll('.quiz-option')[index].classList.add('selected');
    selectedAnswer = index;

    // 제출 버튼 활성화
    document.getElementById('submitQuizBtn').disabled = false;
}

// 퀴즈 제출
async function submitQuiz() {
    if (selectedAnswer === null) {
        alert('답을 선택해주세요');
        return;
    }

    const submitBtn = document.getElementById('submitQuizBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '채점 중...';

    try {
        const data = await submitQuizAPI(selectedAnswer, currentQuiz.correct_answer);

        if (data.success) {
            closeQuiz();
            showResultModal(data, currentQuiz);
            updateProgress(data.user_progress);
        }
    } catch (error) {
        alert('퀴즈 제출 실패: ' + error.message);
    } finally {
        submitBtn.textContent = '제출하기';
        submitBtn.disabled = false;
    }
}

// 결과 모달 표시
function showResultModal(result, quiz) {
    const modal = document.getElementById('resultModal');
    const header = document.getElementById('resultHeader');
    const title = document.getElementById('resultTitle');
    const message = document.getElementById('resultMessage');
    const explanation = document.getElementById('resultExplanation');
    const rewardInfo = document.getElementById('rewardInfo');

    // 정답/오답에 따라 스타일 변경
    if (result.is_correct) {
        header.className = 'result-header correct';
        title.textContent = '🎉 정답입니다!';
        message.textContent = '훌륭해요! 강의 내용을 잘 이해하셨네요.';
    } else {
        header.className = 'result-header incorrect';
        title.textContent = '😅 아쉽네요!';
        message.textContent = '다시 한번 강의를 복습해보세요.';
    }

    // 해설 표시
    explanation.innerHTML = `<strong>💡 해설:</strong><br>${quiz.explanation}`;

    // 보상 정보
    rewardInfo.innerHTML = `
        <div class="reward-item">
            <div class="reward-label">획득 포인트</div>
            <div class="reward-value">+${result.reward.points}</div>
        </div>
        <div class="reward-item">
            <div class="reward-label">연속 정답</div>
            <div class="reward-value">${result.reward.streak}🔥</div>
        </div>
    `;

    modal.classList.add('show');
}

// 진행 상황 업데이트
function updateProgress(progress) {
    document.getElementById('totalPoints').textContent = progress.points;
    document.getElementById('currentStreak').textContent = progress.streak;
}

// 퀴즈 모달 닫기
function closeQuiz() {
    document.getElementById('quizModal').classList.remove('show');
    selectedAnswer = null;
}

// 결과 모달 닫기
function closeResult() {
    document.getElementById('resultModal').classList.remove('show');
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const quizModal = document.getElementById('quizModal');
    const resultModal = document.getElementById('resultModal');
    
    if (event.target === quizModal) {
        closeQuiz();
    }
    if (event.target === resultModal) {
        closeResult();
    }
}