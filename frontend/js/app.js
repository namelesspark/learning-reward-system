// 앱 초기화
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Learning Reward System 시작');

    // 서버 헬스 체크
    const isServerRunning = await checkHealth();
    
    if (!isServerRunning) {
        alert('⚠️ 서버가 실행되지 않았습니다.\n백엔드 서버를 먼저 실행해주세요.');
        return;
    }

    console.log('✅ 서버 연결 완료');
    
    // Enter 키 이벤트
    document.getElementById('videoUrl').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadVideo();
        }
    });
});

// 전역 에러 핸들러
window.addEventListener('error', (e) => {
    console.error('Global Error:', e.error);
});

// 전역 Promise rejection 핸들러
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});