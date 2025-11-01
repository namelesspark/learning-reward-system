import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API Keys
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    
    # Flask
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    
    # CORS
    CORS_ORIGINS = ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://172.25.109.44:8000' ]
    
    # AI Settings
    AI_MODEL = 'gpt-4-mini'
    AI_TEMPERATURE = 0.7
    AI_MAX_TOKENS = 500
    
    # Quiz Settings
    QUIZ_PER_VIDEO = 5
    REWARD_POINTS = {
        'correct': 10,
        'streak_bonus': 5
    }