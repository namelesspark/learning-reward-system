# 유튜브 API 관련 서비스
# 유튜브 처리 구현 로직
from youtube_transcript_api import YouTubeTranscriptApi
import re
import yt_dlp


def extract_video_id(url): # 유튜브 URL에서 비디오 ID 추출
    patterns = [
        r'(?:https?://)?(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
        r'(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]{11})'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return ValueError("유효한 YouTube URL이 아닙니다.")



def get_transcript_from_youtube(video_id): # 유튜브 자막 가져오기 호출: get_transcript()
    try:
        print(f"📝 YouTube 자막 시도: {video_id}")
        ytt_api = YouTubeTranscriptApi()
        transcript_list = ytt_api.list(video_id) # 자막 리스트 가져오기
        try: # 한국어 → 영어 순서로 시도
            transcript = transcript_list.find_transcript(['ko', 'kr'])
            print("✅ 한국어 자막 사용")
        except:
            try:
                transcript = transcript_list.find_transcript(['en'])
                print("✅ 영어 자막 사용")
            except:
                transcript = transcript_list.find_transcript([transcript_list[0].language_code])
                print("✅ 자동생성 자막 사용")
        
        fetched = transcript.fetch() # 자막 데이터 가져오기
        transcript_data = fetched.to_raw_data()
        full_text = ' '.join([item['text'] for item in transcript_data]) # 모든 자막 텍스트 결합
        
        # 타임스탬프 포함
        timestamps = [
            {
                'start': item['start'],
                'text': item['text']
            }
            for item in transcript_data
        ]
        
        return {
            'text': full_text,
            'timestamps': timestamps,
            'source': 'youtube'
        }
        
    except Exception as e:
        print(f"❌ YouTube 자막 실패: {e}")
        return None



def download_audio(video_id): # 유튜브 오디오 다운로드(Whisper용)
    try: 
        print(f"🎧 오디오 다운로드 시도: {video_id}")
        ydl_opts = { # 오디오 전용 다운로드 옵션
            'format': 'bestaudio/best',
            'outtmpl': f'/tmp/{video_id}.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }

        # 다운로드
        url = f'https://www.youtube.com/watch?v={video_id}'
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        audio_path = f'/tmp/{video_id}.mp3'
        print(f"✅ 오디오 다운로드 완료: {audio_path}")
        
        return audio_path

    except Exception as e:
        print(f"❌ 오디오 다운로드 실패: {e}")
        return None




def get_transcript(video_url): # 자막 추출 메인 함수 / 호출: main.py의 /api/video/load
    video_id = extract_video_id(video_url)
    
    # 1순위: YouTube 자막
    transcript = get_transcript_from_youtube(video_id)
    if transcript:
        return {
            'video_id': video_id,
            'transcript': transcript
        }
    
    # 2순위: Whisper (오디오 다운로드만 하고 whisper_service로 넘김)
    print("⚠️  YouTube 자막 없음 → Whisper 사용")
    audio_path = download_audio(video_id)
    
    return {
        'video_id': video_id,
        'audio_path': audio_path,
        'needs_whisper': True
    }