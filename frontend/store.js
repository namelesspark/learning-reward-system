import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getUserScore, addUserScore } from './score.js';

// 상품 목록 (점수 단위)
const products = [
  { id: 1, name: '바나나킥', price: 2500, img: 'images/Bananakick.png'},
  { id: 2, name: '바나나맛 우유', price: 2500, img: 'images/bananamilk.png' },
  { id: 3, name: '짜파게티', price: 2000, img: 'images/Chapagetti.png' },
  { id: 4, name: '코카콜라', price: 2200, img: 'images/Cocacola.png' },
  { id: 5, name: 'cu 5000원권', price: 5200, img: 'images/cu.png' },
  { id: 6, name: '선물', price: 500, img: 'images/gift.png' },
  { id: 7, name: 'gs25 5000원권', price: 5200, img: 'images/gs25.png' },
  { id: 8, name: '펩시콜라', price: 2000, img: 'images/pepsi.png' },
  { id: 9, name: '선물', price: 500, img: 'images/gift.png' },
  { id: 10, name: '선물', price: 502, img: 'images/gifte.png' },
  { id: 1, name: '바나나킥', price: 2500, img: 'images/Bananakick.png'},
  { id: 2, name: '바나나맛 우유', price: 2500, img: 'images/bananamilk.png' },
  { id: 3, name: '짜파게티', price: 2000, img: 'images/Chapagetti.png' },
  { id: 4, name: '코카콜라', price: 2200, img: 'images/Cocacola.png' },
  { id: 5, name: 'cu 5000원권', price: 5200, img: 'images/cu.png' },
  { id: 6, name: '선물', price: 500, img: 'images/gift.png' },
  { id: 7, name: 'gs25 5000원권', price: 5200, img: 'images/gs25.png' },
  { id: 8, name: '펩시콜라', price: 2000, img: 'images/pepsi.png' },
  { id: 9, name: '선물', price: 500, img: 'images/gift.png' },
  { id: 10, name: '선물', price: 502, img: 'images/gifte.png' },
  { id: 1, name: '바나나킥', price: 2500, img: 'images/Bananakick.png'},
  { id: 2, name: '바나나맛 우유', price: 2500, img: 'images/bananamilk.png' },
  { id: 3, name: '짜파게티', price: 2000, img: 'images/Chapagetti.png' },
  { id: 4, name: '코카콜라', price: 2200, img: 'images/Cocacola.png' },
  { id: 5, name: 'cu 5000원권', price: 5200, img: 'images/cu.png' },
  { id: 6, name: '선물', price: 500, img: 'images/gift.png' },
  { id: 7, name: 'gs25 5000원권', price: 5200, img: 'images/gs25.png' },
  { id: 8, name: '펩시콜라', price: 2000, img: 'images/pepsi.png' },
  { id: 9, name: '선물', price: 500, img: 'images/gift.png' },
  { id: 10, name: '선물', price: 502, img: 'images/gifte.png' },

];

let uid = null;
let currentScore = 0;
let selected = new Set();

onAuthStateChanged(window.auth, async (user) => {
  if (!user) return (window.location.href = 'login.html');
  uid = user.uid;

  // 최초 점수 표시
  currentScore = await getUserScore(uid);
  document.getElementById('userScore').textContent = currentScore;

  render();
});

function render() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card' + (selected.has(p.id) ? ' selected' : '');

    const src = p.img || `images/${p.id}.png`;
    card.innerHTML = `
      <div class="product-image">
        <img src="${src}" alt="${p.name}" />
      </div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">${p.price} 점</div>
      <button class="select-btn">${selected.has(p.id) ? '선택됨' : '선택하기'}</button>
    `;

    const imgEl =card.querySelector('.product-image img');
    imgEl.onerror = () => { imgEl.src = 'images/gift.png'; };

  
    card.querySelector('.select-btn').onclick = () => {
      selected.has(p.id) ? selected.delete(p.id) : selected.add(p.id);
      render();
    };
    grid.appendChild(card);
  });
}

document.getElementById('purchaseBtn').addEventListener('click', async () => {
  if (!uid) return;
  if (selected.size === 0) return alert('상품을 선택하세요!');

  const totalCost = [...selected]
    .map(id => products.find(p => p.id === id)?.price || 0)
    .reduce((a, b) => a + b, 0);

  // 최신 점수 재조회(동시 결제 대비)
  currentScore = await getUserScore(uid);
  if (currentScore < totalCost) return alert('점수가 부족합니다.');

  // 차감 & 갱신
  await addUserScore(uid, -totalCost);
  currentScore = await getUserScore(uid);
  document.getElementById('userScore').textContent = currentScore;

  selected.clear();
  render();
  alert(`결제 완료! ${totalCost}점 차감되었습니다.`);
});

// 이전으로
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html"; // ✅ 이동 경로
});