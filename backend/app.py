from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config

from services.video_service import VideoService
from services.chatbot_service import ChatbotService
from services.quiz_service import QuizService

app = Flask(__name__)
CORS(app, origins=Config.CORS_ORIGINS)

# 서비스 초기화
video_service = VideoService()
quiz_service = QuizService()

# 세션 저장소 (실제로는 Redis나 DB 사용)
sessions = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    """헬스 체크"""
    return jsonify({'status': 'ok', 'message': 'Server is running'})

@app.route('/api/video/load', methods=['POST'])
def load_video():
    """비디오 로드 및 자막 추출"""
    data = request.json
    video_url = data.get('video_url')
    session_id = data.get('session_id', 'default')
    
    # 디버깅 로그 추가
    print(f"🔍 Received request:")
    print(f"   Video URL: {video_url}")
    print(f"   Session ID: {session_id}")
    
    if not video_url:
        print("❌ No video URL provided")
        return jsonify({
            'success': False,
            'error': '비디오 URL이 필요합니다'
        }), 400
    
    try:
        print(f"📹 Getting video info...")
        # 비디오 정보 가져오기
        video_info = video_service.get_video_info(video_url)
        print(f"✅ Video info: {video_info}")
        
        print(f"📝 Extracting transcript...")
        # 자막 추출
        transcript_data = video_service.get_transcript(video_url)
        print(f"✅ Transcript length: {len(transcript_data['full_text'])} chars")
        
        # 세션에 저장
        sessions[session_id] = {
            'video_info': video_info,
            'transcript': transcript_data,
            'chatbot': ChatbotService(transcript_data['full_text']),
            'user_progress': {
                'points': 0,
                'streak': 0,
                'quizzes_completed': 0
            }
        }
        
        print(f"✅ Video loaded successfully!")
        
        return jsonify({
            'success': True,
            'video_info': video_info,
            'message': '비디오 로드 완료'
        })
    
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()  # 전체 에러 스택 출력
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/chat', methods=['POST'])
def chat():
    """챗봇 대화"""
    data = request.json
    user_message = data.get('message')
    session_id = data.get('session_id', 'default')
    
    if not user_message:
        return jsonify({
            'success': False,
            'error': '메시지가 필요합니다'
        }), 400
    
    if session_id not in sessions:
        return jsonify({
            'success': False,
            'error': '먼저 비디오를 로드해주세요'
        }), 400
    
    try:
        chatbot = sessions[session_id]['chatbot']
        response = chatbot.get_response(user_message)
        
        return jsonify({
            'success': True,
            'response': response
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/quiz/generate', methods=['POST'])
def generate_quiz():
    """퀴즈 생성"""
    data = request.json
    session_id = data.get('session_id', 'default')
    timestamp = data.get('timestamp', 0)
    
    if session_id not in sessions:
        return jsonify({
            'success': False,
            'error': '먼저 비디오를 로드해주세요'
        }), 400
    
    try:
        transcript_data = sessions[session_id]['transcript']
        
        # 타임스탬프 기반으로 관련 자막 찾기
        relevant_text = transcript_data['full_text'][:1500]  # 임시: 앞부분 사용
        
        quiz = quiz_service.generate_quiz(relevant_text)
        
        return jsonify({
            'success': True,
            'quiz': quiz
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    """퀴즈 답안 제출"""
    data = request.json
    session_id = data.get('session_id', 'default')
    user_answer = data.get('answer')
    correct_answer = data.get('correct_answer')
    
    if session_id not in sessions:
        return jsonify({
            'success': False,
            'error': '세션을 찾을 수 없습니다'
        }), 400
    
    if user_answer is None or correct_answer is None:
        return jsonify({
            'success': False,
            'error': '답안 정보가 필요합니다'
        }), 400
    
    try:
        is_correct = quiz_service.check_answer(user_answer, correct_answer)
        
        # 보상 계산
        current_streak = sessions[session_id]['user_progress']['streak']
        reward = quiz_service.calculate_reward(is_correct, current_streak)
        
        # 진행 상황 업데이트
        if is_correct:
            sessions[session_id]['user_progress']['points'] += reward['points']
            sessions[session_id]['user_progress']['streak'] = reward['streak']
        else:
            sessions[session_id]['user_progress']['streak'] = 0
        
        sessions[session_id]['user_progress']['quizzes_completed'] += 1
        
        return jsonify({
            'success': True,
            'is_correct': is_correct,
            'reward': reward,
            'user_progress': sessions[session_id]['user_progress']
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/progress', methods=['GET'])
def get_progress():
    """학습 진행 상황 조회"""
    session_id = request.args.get('session_id', 'default')
    
    if session_id not in sessions:
        return jsonify({
            'success': False,
            'error': '세션을 찾을 수 없습니다'
        }), 400
    
    return jsonify({
        'success': True,
        'progress': sessions[session_id]['user_progress']
    })

if __name__ == '__main__':
    print("🚀 Learning Reward System Server Starting...")
    print(f"📍 Environment: {Config.FLASK_ENV}")
    print(f"🔧 Debug Mode: {Config.DEBUG}")
    print("✅ Server is ready!")
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5000)