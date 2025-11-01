import openai
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config

class ChatbotService:
    """AI 챗봇 서비스"""
    
    def __init__(self, transcript):
        self.transcript = transcript
        self.conversation_history = []
        openai.api_key = Config.OPENAI_API_KEY
        
        # 시스템 프롬프트
        self.system_prompt = f"""당신은 학습 보조 AI입니다.
다음은 학생이 시청 중인 강의 영상의 자막입니다:

{transcript[:3000]}...

학생의 질문에 이 강의 내용을 기반으로 답변하고,
학습 이해도를 높이는 질문을 생성해주세요."""
    
    def get_response(self, user_message):
        """사용자 메시지에 대한 응답 생성"""
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        messages = [
            {"role": "system", "content": self.system_prompt}
        ] + self.conversation_history
        
        response = openai.ChatCompletion.create(
            model=Config.AI_MODEL,
            messages=messages,
            temperature=Config.AI_TEMPERATURE,
            max_tokens=Config.AI_MAX_TOKENS
        )
        
        assistant_message = response.choices[0].message['content']
        
        self.conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })
        
        return assistant_message
    
    def reset_conversation(self):
        """대화 기록 초기화"""
        self.conversation_history = []