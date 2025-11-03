# Firebase Setup Guide

## 1. Firebase 프로젝트 생성
1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `learning-reward-system`
4. Google Analytics 비활성화 (선택)

## 2. Authentication 활성화
1. 왼쪽 메뉴 → Authentication
2. 시작하기 → 로그인 방법
3. 이메일/비밀번호 활성화
4. 저장

## 3. Firestore Database 생성
1. 왼쪽 메뉴 → Firestore Database
2. 데이터베이스 만들기
3. 테스트 모드로 시작
4. 위치: asia-northeast3 (서울)

## 4. 웹 앱 등록
1. 프로젝트 설정 → 일반
2. 내 앱 → 웹 앱 추가
3. 앱 닉네임: `learning-web`
4. Firebase SDK 구성 복사

## 5. Firestore 컬렉션 구조
```
users/
  {userId}/
    email: string
    displayName: string
    totalScore: number
    createdAt: timestamp

scores/
  {scoreId}/
    userId: string
    videoUrl: string
    score: number
    correctAnswers: number
    totalQuestions: number
    timestamp: timestamp

leaderboard/
  {userId}/
    displayName: string
    totalScore: number
    rank: number
    lastUpdated: timestamp
```