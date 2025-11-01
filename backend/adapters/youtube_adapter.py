from youtube_transcript_api import YouTubeTranscriptApi
from config import Config
import re
import requests

class YouTubeAdapter:
    """YouTube 플랫폼 어댑터"""
    
    def extract_video_id(self, url):
        """유튜브 URL에서 비디오 ID 추출"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
            r'youtube\.com\/embed\/([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        raise ValueError("유효하지 않은 유튜브 URL입니다")
    

    def extract_transcript(self, video_url):
            return self.extract_transcript_official(video_url)

    def extract_transcript_official(self, video_url):
        video_id = self.extract_video_id(video_url)
        YOUTUBE_API_KEY = Config.YOUTUBE_API_KEY
        try:
            # 1. 자막 목록 조회
            url = "https://www.googleapis.com/youtube/v3/captions"
            params = {
                "part": "snippet",
                "videoId": video_id,
                "key": YOUTUBE_API_KEY
            }
            response = requests.get(url, params=params)
            response.raise_for_status()
            captions_list = response.json()

            # public 자막이 없으면 에러
            if 'items' not in captions_list or len(captions_list['items']) == 0:
                raise Exception("공개 자막이 없거나 접근 권한이 없습니다.")

            # 2. 자막 ID 가져오기 (첫 번째 캡션 선택)
            caption_id = captions_list['items'][0]['id']

            # 3. 자막 내용 다운로드 (공식 API는 OAuth 필요, 여기서는 간단 예시로 URL 생성)
            # 실제 자막 내용 다운로드는 인증 추가 구현 필요
            transcript_text = f"Caption ID: {caption_id} (캡션 내용 다운로드는 OAuth 인증 필요)"

            return {
                'segments': [],
                'full_text': transcript_text
            }
        except Exception as e:
            raise Exception(f"공식 API 자막 추출 실패: {str(e)}")
    


    def get_video_info(self, video_url):
        """비디오 정보 가져오기"""
        video_id = self.extract_video_id(video_url)
        return {
            'video_id': video_id,
            'embed_url': f'https://www.youtube.com/embed/{video_id}',
            'platform': 'youtube'
        }