import os
from dotenv import load_dotenv

load_dotenv()

class Config:

    # API 키
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    FIREBASE_API_KEY = os.getenv('FIREBASE_API_KEY')
    YOUTUBEDATA_API_KEY = os.getenv('YOUTUBEDATA_API_KEY')

    # 리눅스 환경 설정
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = True

    #CORS 설정
    CORS_ORIGINS = ['*'] # 모든 출처 허용

    # AI 설정
    AI_MODEL = 'gpt-3.5-turbo'
    AI_TEMPERATURE = 0.7
    AI_MAX_TOKENS = 1000