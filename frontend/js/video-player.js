// 비디오 로드
async function loadVideo() {
    const videoUrl = document.getElementById('videoUrl').value.trim();
    const loadBtn = document.getElementById('loadBtn');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');

    if (!videoUrl) {
        alert('유튜브 링크를 입력하세요');
        return;
    }

    // 버튼 비활성화
    loadBtn.disabled = true;
    loadBtn.textContent = '⏳ 로딩 중...';
    statusText.textContent = '자막 분석 중...';

    try {
        // API 호출
        const data = await loadVideoAPI(videoUrl);

        if (data.success) {
            // 비디오 표시
            displayVideo(data.video_info);

            // 상태 업데이트
            statusText.textContent = '✓ 자막 분석 완료';
            statusDot.classList.add('active');

            // 챗봇/퀴즈 활성화
            document.getElementById('userInput').disabled = false;
            document.getElementById('sendBtn').disabled = false;
            document.getElementById('quizBtn').disabled = false;

            // 챗봇에 환영 메시지
            addChatMessage('assistant', '영상 자막을 분석했습니다! 궁금한 점을 물어보세요. 💡');

            loadBtn.textContent = '✅ 로드 완료';
            setTimeout(() => {
                loadBtn.textContent = '📺 영상 로드';
                loadBtn.disabled = false;
            }, 2000);
        }
    } catch (error) {
        alert('비디오 로드 실패: ' + error.message);
        loadBtn.textContent = '📺 영상 로드';
        loadBtn.disabled = false;
        statusText.textContent = '자막 분석 실패';
    }
}

// 비디오 표시
function displayVideo(videoInfo) {
    const videoPlayer = document.getElementById('videoPlayer');
    
    videoPlayer.innerHTML = `
        <iframe 
            src="${videoInfo.embed_url}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
}

// URL에서 비디오 ID 추출
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/
    ];

    for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}