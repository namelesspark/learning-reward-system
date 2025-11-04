// init-firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAmGKMQT1TEPRKVl5ptIbWXoOjHjRysWiY",
  authDomain: "lrsystem-91ca1.firebaseapp.com",
  projectId: "lrsystem-91ca1",
  storageBucket: "lrsystem-91ca1.appspot.com",
  messagingSenderId: "899913314717",
  appId: "1:899913314717:web:643bd6abd196f10789bf74",
  measurementId: "G-ERNPFHHCKM"
};

//위에 부분 입력하기

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
window.auth = getAuth(app);
window.db = getFirestore(app);
