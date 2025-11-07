// ========================================
// 🎬 lecture.js — 강의 페이지 로직
// ========================================

import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getUserScore } from './score.js';


// Firebase 대기
function waitForFirebase() {
    return new Promise((resolve) => {
        const check = () => {
            if (window.auth && window.db) resolve();
            else setTimeout(check, 50);
        };
        check();
    });
}


const API_URL = 'http://172.25.109.44:5000'; // 백엔드 API URL
let currentUserId = null; // 현재 사용자 ID



async function init() {
    await waitForFirebase();
    
    window.auth.onAuthStateChanged((user) => { // 로그인 확인
        if (user) {
            currentUserId = user.uid;
            document.getElementById('userName').textContent = user.displayName || '사용자';
            loadUserScore();
        } else {
            window.location.href = 'index.html';
        }
    });

    // 버튼 이벤트
    document.getElementById('loadBtn').addEventListener('click', loadVideo);
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
    
    // 로그아웃
    document.getElementById('userBtn').addEventListener('click', () => {
        document.getElementById('logoutBox').classList.toggle('hidden');
    });
    
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await window.auth.signOut();
        window.location.href = 'login.html';
    });
    
    document.getElementById('videoUrl').addEventListener('keypress', (e) => { // Enter 키 지원
        if (e.key === 'Enter') loadVideo();
    });
}




const db = getFirestore();
async function loadUserScore() { // 사용자 점수 로드
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUserId));
        if (userDoc.exists) {
            const score = await getUserScore(currentUserId);
            document.getElementById('userScore').textContent = score;
        }
    } catch (error) {
        console.error('점수 로드 실패:', error);
    }
}


async function loadVideo() { // 영상 로드
    const videoUrl = document.getElementById('videoUrl').value.trim();
    
    if (!videoUrl) {
        alert('유튜브 링크를 입력하세요');
        return;
    }
    
    // 로딩 표시
    const loadBtn = document.getElementById('loadBtn');
    const originalText = loadBtn.textContent;
    loadBtn.textContent = '로딩 중...'; loadBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/api/video/load`, { // 백엔드 API 호출
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                video_url: videoUrl,
                user_id: currentUserId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ 영상 로드 성공:', data);
            localStorage.setItem('videoURL', videoUrl);
            localStorage.setItem('videoId', data.video_id);
            localStorage.setItem('quizSchedule', JSON.stringify(data.quiz_schedule)); // ← 퀴즈 스케줄!
            console.log('퀴즈 스케줄:', data.quiz_schedule);
            window.location.href = 'lecture_view.html';
        } else {
            throw new Error(data.error || '영상 로드 실패');
        }
        
    } catch (error) {
        console.error('❌ 에러:', error);
        alert('영상 로드 실패: ' + error.message);
        
    } finally {
        // 로딩 해제
        loadBtn.textContent = originalText;
        loadBtn.disabled = false;
    }
}
init();



// 로그아웃
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await window.auth.signOut();
  alert('로그아웃 되었습니다.');
  window.location.href = 'index.html';
});

// 이전으로 가기
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = 'index.html';
});