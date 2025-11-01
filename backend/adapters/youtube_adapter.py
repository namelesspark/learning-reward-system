from youtube_transcript_api import YouTubeTranscriptApi
import re

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
        """유튜브 자막 추출"""
        video_id = self.extract_video_id(video_url)
        
        print(f"🔍 Video ID: {video_id}")
        
        try:
            # 간단한 방법: get_transcript 직접 사용
            print("📝 Attempting to get transcript...")
            
            # 한국어 시도
            try:
                print("  Trying Korean...")
                transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=['ko'])
                print("✅ Using Korean transcript")
            except Exception as e:
                print(f"  Korean failed: {e}")
                # 영어 시도
                try:
                    print("  Trying English...")
                    transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
                    print("✅ Using English transcript")
                except Exception as e2:
                    print(f"  English failed: {e2}")
                    # 자동 감지 (언어 지정 없이)
                    print("  Trying auto-detect...")
                    transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
                    print("✅ Using auto-detected transcript")
            
            if not transcript_data:
                raise Exception("자막 데이터가 비어있습니다")
            
            print(f"✅ Got {len(transcript_data)} transcript entries")
            
            # 텍스트와 타임스탬프 분리
            full_text = ' '.join([item['text'] for item in transcript_data])
            timestamps = [
                {
                    'start': item['start'],
                    'duration': item['duration'],
                    'text': item['text']
                }
                for item in transcript_data
            ]
            
            print(f"✅ Transcript extracted: {len(full_text)} characters")
            
            return {
                'full_text': full_text,
                'timestamps': timestamps,
                'video_id': video_id
            }
        
        except Exception as e:
            print(f"❌ Final error: {type(e).__name__}: {str(e)}")
            raise Exception(f"자막 추출 실패: {str(e)}. 자막이 있는 영상인지 확인해주세요.")
    
    def get_video_info(self, video_url):
        """비디오 정보 가져오기"""
        video_id = self.extract_video_id(video_url)
        return {
            'video_id': video_id,
            'embed_url': f'https://www.youtube.com/embed/{video_id}',
            'platform': 'youtube'
        }