// ========================================
// 📊 score.js — Firestore 점수 관리
// ========================================

import { doc, getDoc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// 사용자 점수 불러오기
export async function getUserScore(uid) {
  const ref = doc(window.db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data().totalScore ?? 0;
  return 0;
}

// 점수 업데이트 (직접 세팅)
export async function setUserScore(uid, newScore) {
  const ref = doc(window.db, 'users', uid);
  await updateDoc(ref, { totalScore: newScore });
  return newScore;
}

// 점수 증가/감소 (increment)
export async function addUserScore(uid, delta) {
  const ref = doc(window.db, 'users', uid);
  await updateDoc(ref, { totalScore: increment(delta) });
}
