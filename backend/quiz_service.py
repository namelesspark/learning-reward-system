# 퀴즈 생성 로직
from openai import OpenAI
import json, re, traceback
from config import Config

client = OpenAI(api_key=Config.OPENAI_API_KEY)

def generate_quiz(transcript_text, timestamp_start=0, num_quizzes=None, timestamp_end=None): # 특정 구간의 텍스트로 퀴즈 생성 / 호출: main.py의 /api/quiz/generate
    try:
        if num_quizzes is None:
            num_quizzes = 5
        print(f"🧠 퀴즈 생성 시도 중...({timestamp_start}초~ {timestamp_end}초)")
        segmented_text = transcript_text[:1500]
        # 프롬프트 설정
        prompt = (
            f"아래 강의 내용을 참고해 객관식 퀴즈 {num_quizzes}개를 꼭 정확한, 유효한 JSON 배열만으로 반환하세요. "
            f"필수 형식: "
            f"["
            f'{{"question": "...", "options": ["1","2","3","4","5"], "correct_answer": 2, "explanation": "..."}},'
            f"..."
            f"] "
            "JSON 배열 이외의 텍스트, 코드블록, 설명, 공백, 줄바꿈 금지! "
            "반드시 배열 마지막에 ]로 닫으세요! "
        )
        
        response = client.chat.completions.create(
            model=Config.AI_MODEL,
            messages=[
                {"role": "system", "content": "너는 JSON 배열만 반환하는 퀴즈 생성기다. JSON 외 다른 텍스트 절대 금지."},
                {"role": "user", "content": f"""
                다음 강의 내용을 바탕으로 객관식 퀴즈 {num_quizzes}개를 만들어 주세요.
                각 퀴즈는 다음 형식의 JSON 객체로 표현하세요.
                [
                {{"question": "...", "options": ["1", "2", "3", "4", "5"], "correct_answer": 1, "explanation": "..."}},
                ...
                ]
                강의 내용:
                {segmented_text}
                JSON 배열로만 응답하세요.
                """}
            ],
            temperature=Config.AI_TEMPERATURE,
            max_tokens=Config.AI_MAX_TOKENS
        )
        
        content = response.choices[0].message.content # 응답 내용 추출
        print(f"📝 AI 응답:\n{content}\n")

        match = re.search(r'(\[.*\]|\{.*\})', content, re.DOTALL)
        if match: # JSON 형태 처리
            content = match.group(0).strip()
        quizzes = json.loads(content)
        if isinstance(quizzes, list):
            return quizzes
        else:
            return [quizzes]


    except Exception as e:
        print(f"❌ 퀴즈 생성 실패: {e}")
        traceback.print_exc()


def check_answer(user_answer, correct_answer): # 정답 확인 / 호출: main.py의 /api/quiz/submit
    return user_answer == correct_answer


def calculate_score(is_correct): # 점수 계산 / 호출: main.py의 /api/quiz/submit
    return 1 if is_correct else 0