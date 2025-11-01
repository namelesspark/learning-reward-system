// ==========================================================
// 🎥 video-player.js — 유튜브 로드 + STT 상태 연동
//  - 전역: loadVideo, displayVideo, extractVideoId
//  - 의존: api.js (window.loadVideoAPI)
// ==========================================================

// 비디오 로드
async function loadVideo() {
  const urlInput   = document.getElementById('videoUrl');
  const loadBtn    = document.getElementById('loadBtn');
  const statusText = document.getElementById('statusText');
  const statusDot  = document.getElementById('statusDot');

  if (!urlInput) {
    alert('입력 요소가 없습니다. index.html을 확인하세요.');
    return;
  }

  const videoUrl = (urlInput.value || '').trim();
  if (!videoUrl) {
    alert('유튜브 링크를 입력하세요');
    return;
  }

  // 버튼/상태 표시
  if (loadBtn) {
    loadBtn.disabled = true;
    loadBtn.textContent = '⏳ 로딩 중...';
  }
  if (statusText) statusText.textContent = '자막 분석 중...';

  try {
    if (typeof window.loadVideoAPI !== 'function') {
      throw new Error('STT API가 준비되지 않았습니다 (api.js 로드 순서를 확인).');
    }

    // Flask 백엔드에 STT 요청
    const data = await window.loadVideoAPI(videoUrl);

    if (!data || data.success === false) {
      throw new Error((data && data.error) || 'STT 서버 요청 실패');
    }

    // 비디오 표시
    displayVideo(data.video_info);

    // 상태 업데이트
    if (statusText) statusText.textContent = '✓ 자막 분석 완료';
    if (statusDot)  statusDot.classList.add('active');

    // 챗봇 / 입력 활성화
    const userInput = document.getElementById('userInput');
    const sendBtn   = document.getElementById('sendBtn');
    const quizBtn   = document.getElementById('quizBtn');

    if (userInput) userInput.disabled = false;
    if (sendBtn)   sendBtn.disabled   = false;

    // 리워드 ON/OFF와 연동하여 퀴즈 버튼 활성화
    let rewardOn = true;
    if (typeof window.__frontendRewardOn === 'function') {
      try { rewardOn = !!window.__frontendRewardOn(); } catch (_) { rewardOn = true; }
    }
    if (quizBtn) quizBtn.disabled = !rewardOn;

    // 챗봇에 안내 메시지
    if (typeof window.addChatMessage === 'function') {
      window.addChatMessage('assistant', '영상 자막을 분석했습니다! 궁금한 점을 물어보세요. 💡');
    }

    if (loadBtn) {
      loadBtn.textContent = '✅ 로드 완료';
      setTimeout(() => {
        loadBtn.textContent = '📺 영상 로드';
        loadBtn.disabled = false;
      }, 1200);
    }
  } catch (error) {
    alert('비디오 로드 실패: ' + (error && error.message ? error.message : String(error)));
    if (loadBtn) {
      loadBtn.textContent = '📺 영상 로드';
      loadBtn.disabled = false;
    }
    if (statusText) statusText.textContent = '자막 분석 실패';
  }
}

// 비디오 표시
function displayVideo(videoInfo) {
  const videoPlayer = document.getElementById('videoPlayer');
  if (!videoPlayer) return;

  const embed = (videoInfo && videoInfo.embed_url) ? String(videoInfo.embed_url) : '';
  if (!embed) return;

  videoPlayer.innerHTML = (
    '<iframe ' +
      'src="' + embed + '" ' +
      'frameborder="0" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'referrerpolicy="strict-origin-when-cross-origin" ' +
      'allowfullscreen>' +
    '</iframe>'
  );
}

// URL에서 비디오 ID 추출 (필요 시 사용)
function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = url.match(patterns[i]);
    if (m && m[1]) return m[1];
  }
  return null;
}

// 전역 바인딩 (index.html의 onclick="loadVideo()" 대응)
window.loadVideo = loadVideo;
window.displayVideo = displayVideo;
window.extractVideoId = extractVideoId;
