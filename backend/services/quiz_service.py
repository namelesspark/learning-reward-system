import openai
import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config

class QuizService:
    """퀴즈 생성 및 보상 관리 서비스"""
    
    def __init__(self):
        openai.api_key = Config.OPENAI_API_KEY
    
    def generate_quiz(self, transcript_segment, difficulty='medium'):
        """특정 구간의 자막으로 퀴즈 생성"""
        prompt = f"""다음 강의 내용을 바탕으로 학습 이해도를 확인할 수 있는 객관식 문제를 만들어주세요.

강의 내용:
{transcript_segment}

다음 JSON 형식으로 응답해주세요:
{{
    "question": "문제 내용",
    "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
    "correct_answer": 0,
    "explanation": "정답 해설"
}}

난이도: {difficulty}
"""
        
        try:
            response = openai.ChatCompletion.create(
                model=Config.AI_MODEL,
                messages=[
                    {"role": "system", "content": "당신은 교육 전문가입니다."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            # JSON 파싱
            content = response.choices[0].message['content']
            # JSON 코드 블록 제거 (```json ... ``` 형태)
            if '```' in content:
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            
            quiz_data = json.loads(content.strip())
            return quiz_data
        
        except Exception as e:
            # 에러 시 기본 퀴즈 반환
            return {
                "question": "강의 내용을 이해하셨나요?",
                "options": ["매우 잘 이해했다", "대체로 이해했다", "조금 이해했다", "이해하지 못했다"],
                "correct_answer": 0,
                "explanation": "복습이 필요하다면 다시 시청해보세요!"
            }
    
    def check_answer(self, user_answer, correct_answer):
        """답변 체크"""
        return user_answer == correct_answer
    
    def calculate_reward(self, is_correct, current_streak=0):
        """보상 계산"""
        if not is_correct:
            return {'points': 0, 'streak': 0}
        
        points = Config.REWARD_POINTS['correct']
        new_streak = current_streak + 1
        
        # 연속 정답 보너스
        if new_streak >= 3:
            points += Config.REWARD_POINTS['streak_bonus']
        
        return {
            'points': points,
            'streak': new_streak
        }