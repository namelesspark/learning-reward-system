# 유튜브 API 관련 서비스
# 유튜브 처리 구현 로직
from googleapiclient.discovery import build
import isodate
from youtube_transcript_api import YouTubeTranscriptApi
from config import Config
import re

YOUTUBEDATA_API_KEY = Config.YOUTUBEDATA_API_KEY
youtube = build('youtube', 'v3', developerKey=YOUTUBEDATA_API_KEY)

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


def extract_video_length(video_url):  # API를 통해 영상 길이 가져오기
    try:
        video_id = extract_video_id(video_url)
        print(f"🎬 영상 길이 조회 중: {video_id}")

        response = youtube.videos().list( # YouTube Data API 요청
            part="contentDetails",
            id=video_id
        ).execute()

        if not response["items"]:
            raise Exception("영상 정보를 찾을 수 없습니다.")

        # ISO 8601 형식(Pt5M10S 등)을 초 단위로 변환
        duration_iso = response["items"][0]["contentDetails"]["duration"]
        duration_seconds = int(isodate.parse_duration(duration_iso).total_seconds())
        print(f"✅ 영상 길이: {duration_seconds}초")
        return {
            "video_id": video_id,
            "duration": duration_seconds
        }

    except Exception as e:
        print(f"❌ 영상 길이 추출 실패: {e}")


def get_transcript(video_url): # 자막 추출 메인 함수 / 호출: main.py의 /api/video/load
    video_id = extract_video_id(video_url)
    
    # YouTube 자막
    transcript = get_transcript_from_youtube(video_id)
    
    # 영상 길이
    video_len = extract_video_length(video_url)
    
    return {
        'video_id': video_id,
        'transcript': transcript,
        'duration': video_len.get("duration", 600)
    }