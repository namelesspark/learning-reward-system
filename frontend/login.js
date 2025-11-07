// ========================================
// 🔐 login.js
// ========================================
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    RecaptchaVerifier
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import {
    doc,
    setDoc,
    serverTimestamp,
    collection,
    getDocs,
    query,
    where
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// reCAPTCHA 초기화
async function initRecaptcha() {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(window.auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {
                console.log('reCAPTCHA verified');
            }
        });
    }
}

// =========================
// 🔄 폼 전환 함수들
// =========================
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('findPasswordForm').classList.add('hidden');
    document.getElementById('findIdForm')?.classList.add('hidden');
}

function showSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('findPasswordForm').classList.add('hidden');
    document.getElementById('findIdForm')?.classList.add('hidden');
}

function showFindPassword() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('findPasswordForm').classList.remove('hidden');
    document.getElementById('findIdForm')?.classList.add('hidden');
}

function showFindId() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('findPasswordForm').classList.add('hidden');
    document.getElementById('findIdForm').classList.remove('hidden');
}

// =========================
// 🔑 로그인
// =========================
async function login() {
    await waitForFirebase();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        alert('이메일과 비밀번호를 입력하세요');
        return;
    }

    try {
        // reCAPTCHA 초기화
        await initRecaptcha();
        
        const userCredential = await signInWithEmailAndPassword(window.auth, email, password);
        console.log('로그인 성공:', userCredential.user);
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('로그인 실패:', error);
        alert('로그인 실패: ' + error.message);
    }
}

// =========================
// 🧾 회원가입
// =========================
async function signup() {
    await waitForFirebase();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value.trim();

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
        await updateProfile(user, { displayName: name });

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

// =========================
// 🔄 비밀번호 재설정
// =========================
async function resetPassword() {
    await waitForFirebase();
    
    const email = document.getElementById('resetEmail').value.trim();

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

// =========================
// 🔍 아이디(이메일) 찾기
// =========================
async function findId() {
    await waitForFirebase();
    
    const name = document.getElementById('findName').value.trim();
    const partial = document.getElementById('findPartialEmail').value.trim();

    if (!name || !partial) {
        alert('이름과 이메일 일부를 입력하세요');
        return;
    }

    try {
        const q = query(collection(window.db, 'users'), where('displayName', '==', name));
        const snapshot = await getDocs(q);

        let foundEmail = null;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.email.includes(partial)) foundEmail = data.email;
        });

        if (foundEmail) {
            const masked = foundEmail.replace(/(.{2})(.*)(@.*)/,
                (_, a, b, c) => a + '*'.repeat(b.length) + c);
            alert(`등록된 이메일: ${masked}`);
        } else {
            alert('일치하는 사용자를 찾을 수 없습니다.');
        }

        showLogin();
    } catch (err) {
        console.error('아이디 찾기 실패:', err);
        alert('아이디 찾기 실패: ' + err.message);
    }
}

// =========================
// 🌍 전역 함수 등록
// =========================
window.showLogin = showLogin;
window.showSignup = showSignup;
window.showFindPassword = showFindPassword;
window.showFindId = showFindId;
window.login = login;
window.signup = signup;
window.resetPassword = resetPassword;
window.findId = findId;
