# Flask 메인 애플리케이션 설정

from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
import youtube_service
import whisper_service
import quiz_service
import chat_service

app = Flask(__name__)
CORS(app, origins=Config.CORS_ORIGINS)

sessions = {} # 세션 데이터 저장용 (간단한 구현)

@app.route('/api/video/load', methods=['POST'])
def load_video(): # 비디오 로드 및 자막 추출
    data = request.json
    video_url = data.get('video_url')
    user_id = data.get('user_id', 'guest')

    try:
        print(f"🌐 비디오 로드 요청: {video_url}")
        result = youtube_service.get_transcript(video_url) # 자막 추출 시도
        if result.get('needs_whisper'):
            audio_path = result['audio_path']
            transcript = whisper_service.transcribe_audio(audio_path) # Whisper 전사
            result['transcript'] = transcript

        # 세션에 저장
        sessions[user_id] = {
            'video_id': result['video_id'],
            'transcript': result['transcript'],
            'current_score': 0
        }

        return jsonify({
            'success': True,
            'video_id': result['video_id'],
            'transcript': result['transcript']
        })
    
    except Exception as e:
        print(f"❌ 에러: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/quiz/generate', methods=['POST'])
def generate_quiz():
    try:
        data = request.json
        user_id = data.get('user_id', 'guest')
        timestamp = data.get('timestamp', 0)
        
        # 세션에서 자막 가져오기
        if user_id not in sessions:
            return jsonify({
                'success': False,
                'error': '먼저 영상을 로드하세요'
            }), 400
        
        transcript_text = sessions[user_id]['transcript']['text']
        
        # 퀴즈 생성
        quiz = quiz_service.generate_quiz(transcript_text, timestamp, None)
        
        return jsonify({
            'success': True,
            'quiz': quiz
        })
        
    except Exception as e:
        print(f"❌ 에러: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    try:
        data = request.json
        user_id = data.get('user_id', 'guest')
        user_answer = data.get('answer')
        correct_answer = data.get('correct_answer')
        
        # 정답 확인
        is_correct = quiz_service.check_answer(user_answer, correct_answer)
        
        # 점수 계산
        score = quiz_service.calculate_score(is_correct)
        
        # 세션 업데이트
        if user_id in sessions:
            sessions[user_id]['current_score'] += score
        
        return jsonify({
            'success': True,
            'is_correct': is_correct,
            'score': score,
            'total_score': sessions.get(user_id, {}).get('current_score', 0)
        })
        
    except Exception as e:
        print(f"❌ 에러: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """
    채팅 API
    
    Request:
        {
            "user_id": "test123",
            "message": "이 강의의 주제가 뭐야?"
        }
    
    Response:
        {
            "success": true,
            "response": "이 강의는 신경망에 대한 내용입니다...",
            "conversation_history": [...]
        }
    """
    try:
        data = request.json
        user_id = data.get('user_id', 'guest')
        user_message = data.get('message')
        
        if not user_message:
            return jsonify({
                'success': False,
                'error': '메시지를 입력하세요'
            }), 400
        
        # 세션 확인
        if user_id not in sessions:
            return jsonify({
                'success': False,
                'error': '먼저 영상을 로드하세요'
            }), 400
        
        # 자막 가져오기
        transcript_text = sessions[user_id]['transcript']['text']
        
        # 대화 히스토리 가져오기 (없으면 빈 리스트)
        if 'conversation_history' not in sessions[user_id]:
            sessions[user_id]['conversation_history'] = []
        
        conversation_history = sessions[user_id]['conversation_history']
        
        # AI 응답 생성
        assistant_response = chat_service.chat(
            transcript_text,
            user_message,
            conversation_history
        )
        
        # 대화 히스토리 업데이트
        sessions[user_id]['conversation_history'].append({
            "role": "user",
            "content": user_message
        })
        sessions[user_id]['conversation_history'].append({
            "role": "assistant",
            "content": assistant_response
        })
        
        # 히스토리 길이 제한 (최근 10개 대화만 유지)
        if len(sessions[user_id]['conversation_history']) > 20:
            sessions[user_id]['conversation_history'] = \
                sessions[user_id]['conversation_history'][-20:]
        
        return jsonify({
            'success': True,
            'response': assistant_response
        })
        
    except Exception as e:
        print(f"❌ 에러: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("🚀 서버 시작...")
    print(f"📍 환경: {Config.FLASK_ENV}")
    print("✅ 준비 완료!")
    
    app.run(
        debug=Config.DEBUG,
        host='0.0.0.0',
        port=5000
    )