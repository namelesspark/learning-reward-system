import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from adapters.youtube_adapter import YouTubeAdapter
#from adapters.video_adapter import VideoAdapter # 나중에 추가
#from adapters.lms_adapter import LmsAdapter    # 나중에 추가

class VideoService:
    """비디오 처리 서비스 (플랫폼 독립적)"""
    
    def __init__(self):
        self.adapters = {
            'youtube': YouTubeAdapter(),
            # 'video': VideoAdapter(),  # 나중에 추가
            # 'lms': LMSAdapter()       # 나중에 추가
        }
    
    def detect_platform(self, url):
        """URL에서 플랫폼 감지"""
        if 'youtube.com' in url or 'youtu.be' in url:
            return 'youtube'
        elif 'vimeo.com' in url:
            return 'vimeo'
        else:
            raise ValueError("지원하지 않는 플랫폼입니다")
    
    def get_transcript(self, video_url):
        """플랫폼 자동 감지 후 자막 추출"""
        platform = self.detect_platform(video_url)
        adapter = self.adapters.get(platform)
        
        if not adapter:
            raise ValueError(f"{platform} 플랫폼은 아직 지원하지 않습니다")
        
        return adapter.extract_transcript(video_url)
    
    def get_video_info(self, video_url):
        """비디오 정보 가져오기"""
        platform = self.detect_platform(video_url)
        adapter = self.adapters.get(platform)
        
        if not adapter:
            raise ValueError(f"{platform} 플랫폼은 아직 지원하지 않습니다")
        
        return adapter.get_video_info(video_url)