// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAmGKMQT1TEPRKVl5ptIbWXoOjHjRysWiY",
  authDomain: "lrsystem-91ca1.firebaseapp.com",
  projectId: "lrsystem-91ca1",
  storageBucket: "lrsystem-91ca1.appspot.com",
  messagingSenderId: "899913314717",
  appId: "1:899913314717:web:643bd6abd196f10789bf74",
  measurementId: "G-ERNPFHHCKM"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 전역으로 노출
window.auth = auth;
window.db = db;

console.log("✅ Firebase 초기화 완료");

// App Check 비활성화 (개발 환경)
// reCAPTCHA 문제 방지
if (typeof window !== 'undefined') {
    window.recaptchaVerifier = null;
}