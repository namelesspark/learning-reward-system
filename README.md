# 🎓 Learning Reward System

포스텍 Mini-TeX-Corps 프로젝트: 학습자 집중 향상 및 학습 보조를 위한 보상 시스템

## 📋 프로젝트 소개

유튜브 강의 영상을 시청하면서 AI 챗봇과 대화하고, 퀴즈를 풀며 학습할 수 있는 웹 애플리케이션입니다.

### 주요 기능
- 🎥 유튜브 영상 자막 자동 추출
- 💬 강의 내용 기반 AI 챗봇
- ❓ 자동 퀴즈 생성 및 보상 시스템
- 🏆 학습 진행도 트래킹

## 🛠️ 기술 스택

**Backend:**
- Python 3.12
- Flask
- OpenAI API
- YouTube Transcript API

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript

## 📦 설치 방법

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/learning-reward-system.git
cd learning-reward-system
```

### 2. 가상환경 생성 및 활성화
```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 3. 패키지 설치
```bash
pip install -r backend/requirements.txt
```

### 4. 환경 변수 설정
```bash
# backend/.env 파일 생성
OPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=development
```

### 5. 실행

**백엔드 서버:**
```bash
cd backend
python app.py
```

**프론트엔드 서버 (새 터미널):**
```bash
cd frontend
python3 -m http.server 8000
```

### 6. 접속
브라우저에서 `http://localhost:8000` 접속

## 📁 프로젝트 구조
```
learning-reward-system/
├── backend/
│   ├── adapters/          # 플랫폼별 어댑터 (YouTube, etc.)
│   ├── services/          # 비즈니스 로직
│   ├── models/            # 데이터 모델
│   ├── utils/             # 유틸리티
│   ├── app.py             # Flask 메인 서버
│   └── config.py          # 설정 관리
├── frontend/
│   ├── css/               # 스타일시트
│   ├── js/                # JavaScript 파일
│   └── index.html         # 메인 HTML
├── docs/                  # 문서
├── tests/                 # 테스트
├── .gitignore
└── README.md
```

## 🔑 API 키 발급

1. [OpenAI Platform](https://platform.openai.com/) 접속
2. API Keys 메뉴에서 새 키 생성
3. `.env` 파일에 키 입력

## 👥 팀 정보

- 금오공대 학부생 3명 팀
- 2025 포스텍 Mini-TeX-Corps 참가

## �� 라이선스

MIT License

## 🤝 기여

Pull Request 환영합니다!
