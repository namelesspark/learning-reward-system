# 🔧 프론트엔드 수정 사항

## 📋 발견된 문제점

### 1. Firebase SDK 버전 불일치 ⚠️
- `init-firebase.js`: v9.23.0
- `login.js`, `score.js`, `dashboard.js`: v10.7.1
- **해결**: 모든 파일을 v9.23.0으로 통일

### 2. Firestore API 불일치 ⚠️
- `lecture.js` (68줄): `window.db.collection('users')` ← 구버전 API
- `score.js`: `doc(window.db, 'users', uid)` ← 신버전 API
- **해결**: 모든 파일에서 v9 modular API 사용

### 3. 백엔드 API 연동 누락 ⚠️
- `lecture_view.js`: 하드코딩된 예시 퀴즈만 있음
- 채팅, 퀴즈 생성 API 호출 없음
- **해결**: 백엔드 API (`/api/chat`, `/api/quiz/generate`, `/api/quiz/submit`) 연동

### 4. 페이지 흐름 문제 ⚠️
- `lecture.js`에서 `lecture_view.html`로 이동 로직 누락
- **해결**: localStorage 저장 후 페이지 이동 추가

---

## ✅ 수정된 파일

### 1. `lecture_fixed.js` (lecture.js 교체)
- Firestore v9 API로 변경 (`doc`, `getDoc` 사용)
- 백엔드 `/api/video/load` 연동
- localStorage에 videoId 저장
- `lecture_view.html`로 자동 이동

### 2. `lecture_view_fixed.js` (lecture_view.js 교체)
- 백엔드 채팅 API (`/api/chat`) 연동
- 백엔드 퀴즈 생성 API (`/api/quiz/generate`) 연동
- 백엔드 퀴즈 제출 API (`/api/quiz/submit`) 연동
- Firebase v9 import로 변경
- 퀴즈 답안 처리 개선

### 3. `login_fixed.js` (login.js 교체)
- Firebase v9.23.0 SDK로 통일
- reCAPTCHA 초기화 추가
- waitForFirebase() 함수 추가

### 4. `score_fixed.js` (score.js 교체)
- Firebase v9.23.0 SDK로 통일

### 5. `dashboard_fixed.js` (dashboard.js 교체)
- Firebase v9.23.0 SDK로 통일
- 로그인 페이지 경로를 `index.html`로 수정

---

## 🚀 적용 방법

### 1. 백업
```bash
cp lecture.js lecture.js.backup
cp lecture_view.js lecture_view.js.backup
cp login.js login.js.backup
cp score.js score.js.backup
cp dashboard.js dashboard.js.backup
```

### 2. 수정된 파일 적용
```bash
mv lecture_fixed.js lecture.js
mv lecture_view_fixed.js lecture_view.js
mv login_fixed.js login.js
mv score_fixed.js score.js
mv dashboard_fixed.js dashboard.js
```

### 3. 백엔드 서버 실행
```bash
cd ~/prototype/backend
source ../venv/bin/activate
python main.py
```

### 4. 프론트엔드 서버 실행
```bash
cd ~/prototype/frontend
python3 -m http.server 8000
```

### 5. 테스트
```
http://localhost:8000/index.html
```

---

## 📝 주요 변경 사항

### API 연동
- ✅ `/api/video/load` - 영상 로드 및 자막 추출
- ✅ `/api/chat` - AI 채팅
- ✅ `/api/quiz/generate` - 퀴즈 생성
- ✅ `/api/quiz/submit` - 퀴즈 답안 제출

### 페이지 흐름
```
index.html (로그인)
    ↓
dashboard.html
    ↓
lecture.html (URL 입력)
    ↓ [백엔드 API 호출]
lecture_view.html (강의 플레이어 + 채팅 + 퀴즈)
```

### Firebase SDK 버전
- 전체: **v9.23.0** (통일)

---

## ⚠️ 주의사항

1. **백엔드 서버 필수**: `http://localhost:5000` 에서 실행 중이어야 함
2. **CORS 설정**: 백엔드 Flask에 CORS 설정 되어있는지 확인
3. **Firebase**: firebaseConfig 설정 확인
4. **로그인 필수**: 모든 기능은 로그인 후 사용 가능

---

## 🐛 트러블슈팅

### "Failed to fetch" 에러
→ 백엔드 서버가 실행 중인지 확인 (`python main.py`)

### "auth is not defined" 에러
→ init-firebase.js가 먼저 로드되는지 확인

### Firestore 에러
→ Firebase Console에서 Firestore Database 활성화 확인

### reCAPTCHA 에러
→ index.html에 `<div id="recaptcha-container"></div>` 있는지 확인

---

## 📞 도움말

문제가 계속되면:
1. 브라우저 콘솔(F12) 확인
2. 백엔드 터미널 로그 확인
3. Firebase Console 확인
