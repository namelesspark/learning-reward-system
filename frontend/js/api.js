// API 설정
const API_URL = 'http://172.25.109.44:5000/api';
const SESSION_ID = 'user_' + Date.now();

// API 호출 헬퍼 함수
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API 요청 실패');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// 헬스 체크
async function checkHealth() {
    try {
        const data = await apiCall('/health');
        console.log('✅ Server is running:', data);
        return true;
    } catch (error) {
        console.error('❌ Server is not responding');
        return false;
    }
}

// 비디오 로드
async function loadVideoAPI(videoUrl) {
    return await apiCall('/video/load', 'POST', {
        video_url: videoUrl,
        session_id: SESSION_ID
    });
}

// 챗봇 메시지 전송
async function sendChatMessage(message) {
    return await apiCall('/chat', 'POST', {
        message: message,
        session_id: SESSION_ID
    });
}

// 퀴즈 생성
async function generateQuizAPI(timestamp = 0) {
    return await apiCall('/quiz/generate', 'POST', {
        session_id: SESSION_ID,
        timestamp: timestamp
    });
}

// 퀴즈 제출
async function submitQuizAPI(answer, correctAnswer) {
    return await apiCall('/quiz/submit', 'POST', {
        session_id: SESSION_ID,
        answer: answer,
        correct_answer: correctAnswer
    });
}

// 진행 상황 조회
async function getProgress() {
    return await apiCall(`/progress?session_id=${SESSION_ID}`);
}