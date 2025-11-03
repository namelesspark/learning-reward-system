# Whisper 서비스 구현

# Youtube 자막이 없을 때 Whisper로 오디오를 텍스트로 변환

from openai import OpenAI
from config import Config

client = OpenAI(api_key=Config.OPENAI_API_KEY)

def transcribe_audio(audio_path): #Whisper API로 오디오 -> 텍스트 변환
    try:
        print(f"📝 Whisper로 오디오 전사 시도: {audio_path}")
        
        with open(audio_path, "rb") as audio_file:
            response = client.Audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json"
            )
        print(f"✅ Whisper 전사 완료: {response['text']}")
        full_text = response['text']
        timestamps = []
        if hasattr(response, 'segments'):
            timestamps = [
                {
                    'start': segment['start'],
                    'text': segment['text']
                }
                for segment in response.segments
            ]
        
        return {
            'text': full_text,
            'timestamps': timestamps,
            'source': 'whisper'
        }
    except Exception as e:
        print(f"❌ Whisper 전사 실패: {e}")
        return None