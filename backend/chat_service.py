from openai import OpenAI
from config import Config

client = OpenAI(api_key=Config.OPENAI_API_KEY)

def create_chat_context(transcript_text):
    return f"""당신은 친절한 학습 도우미 AI입니다.
    학생이 시청 중인 강의 내용:
    {transcript_text[:3000]}
    위 강의 내용을 바탕으로:
    1. 학생의 질문에 명확하게 답변하세요
    2. 이해를 돕는 예시를 들어주세요
    3. 추가 질문을 유도하세요
    4. 친근하고 격려하는 톤으로 대화하세요"""

def chat(transcript_text, user_message, conversation_history=None): # 호출: main.py의 /api/chat / transcript_text:강의자막 user_message:사용자메세지 conversation_history:이전대화
    try:
        print("OpenAI Chat API 호출 시작")

        if conversation_history is None: # 대화 기록 초기화
            conversation_history = []

        system_prompt = create_chat_context(transcript_text) # 시스템 프롬프트

        messages = [
            {"role": "system", "content": system_prompt}
        ] + conversation_history + [
            {"role": "user", "content": user_message}
        ]

        response = client.chat.completions.create( # OpenAI Chat Completion API 호출
            model=Config.AI_MODEL,
            messages=messages,
            temperature=Config.AI_TEMPERATURE,
            max_tokens=Config.AI_MAX_TOKENS
        )

        assistant_message = response.choices[0].message.content
        print(f"{assistant_message[:50]}...") # 응답의 처음 50자 출력
        return assistant_message

    except Exception as e:
        print(f"OpenAI Chat API 호출 중 오류 발생: {e}")
        return "죄송합니다. 현재 질문에 답변할 수 없습니다."
