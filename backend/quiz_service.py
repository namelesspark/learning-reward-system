# 퀴즈 생성 로직
from openai import OpenAI
import json
import traceback
from config import Config

client = OpenAI(api_key=Config.OPENAI_API_KEY)

def generate_quiz(transcript_text, timestamp_start=0, timestamp_end=None): # 특정 구간의 텍스트로 퀴즈 생성 / 호출: main.py의 /api/quiz/generate
    try:
        print(f"🧠 퀴즈 생성 시도 중...({timestamp_start}초~ {timestamp_end}초)")

        segmented_text = transcript_text[:1500]
        
        # 프롬프트 설정
        prompt = f"""다음은 교육용 비디오의 자막입니다. 이 자막을 바탕으로 객관식 퀴즈 5개를 생성해 주세요. 
        각 퀴즈는 질문과 5개의 선택지로 구성되어야 하며, 정답도 함께 제공해 주세요.
        강의 내용:
        {segmented_text}
        오직 JSON 형식으로 응답하세요:
        {{"question": "문제", "options": ["1","2","3","4","5"], "correct_answer": 0, "explanation": "해설"}}"""
        
        # OpenAI API 호출
        response = client.chat.completions.create(
            model=Config.AI_MODEL,
            messages=[
                {"role": "system", "content": "당신은 교육 전문가입니다. 그리고 JSON만 응답하는 엄격한 JSON 생성기입니다. 다른 텍스트 절대 금지."},
                {"role": "user", "content": prompt}
            ],
            temperature=Config.AI_TEMPERATURE,
            max_tokens=Config.AI_MAX_TOKENS,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content # 응답 내용 추출
        print(f"📝 AI 응답:\n{content}\n")

        import re
        match = re.search(r'\{.*\}', content, re.DOTALL)
        # JSON 형태 처리
        if match:
            content = match.group(0)
        print(f"🔍 추출한 JSON:\n{content}\n")
        quiz = json.loads(content)
        print(f"✅ 퀴즈: {quiz['question'][:50]}...")
        return quiz


    except Exception as e:
        print(f"❌ 퀴즈 생성 실패: {e}")
        traceback.print_exc()


def check_answer(user_answer, correct_answer): # 정답 확인 / 호출: main.py의 /api/quiz/submit
    return user_answer == correct_answer


def calculate_score(is_correct): # 점수 계산 / 호출: main.py의 /api/quiz/submit
    return 1 if is_correct else 0