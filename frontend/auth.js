// 인증 관리

// Firebase Auth 함수들
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import {
    doc,
    setDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// 폼 전환
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('findPasswordForm').classList.add('hidden');
}

function showSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('findPasswordForm').classList.add('hidden');
}

function showFindPassword() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('findPasswordForm').classList.remove('hidden');
}

// 로그인
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('이메일과 비밀번호를 입력하세요');
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(window.auth, email, password);
        console.log('로그인 성공:', userCredential.user);
        
        // 대시보드로 이동 (부드러운 전환)
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('로그인 실패:', error);
        alert('로그인 실패: ' + error.message);
    }
}

// 회원가입
async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

    if (!name || !email || !password || !passwordConfirm) {
        alert('모든 필드를 입력하세요');
        return;
    }

    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다');
        return;
    }

    if (password.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다');
        return;
    }

    try {
        // Firebase Auth에 사용자 생성
        const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
        const user = userCredential.user;

        // 프로필 업데이트
        await updateProfile(user, {
            displayName: name
        });

        // Firestore에 사용자 정보 저장
        await setDoc(doc(window.db, 'users', user.uid), {
            email: email,
            displayName: name,
            totalScore: 0,
            createdAt: serverTimestamp()
        });

        // Leaderboard 초기화
        await setDoc(doc(window.db, 'leaderboard', user.uid), {
            displayName: name,
            totalScore: 0,
            rank: 0,
            lastUpdated: serverTimestamp()
        });

        alert('회원가입 성공! 로그인해주세요.');
        showLogin();

    } catch (error) {
        console.error('회원가입 실패:', error);
        alert('회원가입 실패: ' + error.message);
    }
}

// 비밀번호 재설정
async function resetPassword() {
    const email = document.getElementById('resetEmail').value;

    if (!email) {
        alert('이메일을 입력하세요');
        return;
    }

    try {
        await sendPasswordResetEmail(window.auth, email);
        alert('비밀번호 재설정 링크를 이메일로 보냈습니다. 이메일을 확인하세요.');
        showLogin();
        
    } catch (error) {
        console.error('비밀번호 재설정 실패:', error);
        alert('실패: ' + error.message);
    }
}

// 전역 함수로 노출
window.showLogin = showLogin;
window.showSignup = showSignup;
window.showFindPassword = showFindPassword;
window.login = login;
window.signup = signup;
window.resetPassword = resetPassword;