from abc import ABC, abstractmethod

class VideoAdapter(ABC):
    """비디오 플랫폼 어댑터 기본 인터페이스"""
    
    @abstractmethod
    def extract_transcript(self, video_url):
        """
        비디오 URL에서 자막 추출
        
        Args:
            video_url (str): 비디오 URL
            
        Returns:
            dict: {
                'full_text': str,
                'timestamps': list,
                'video_id': str
            }
        """
        pass
    
    @abstractmethod
    def get_video_info(self, video_url):
        """
        비디오 정보 가져오기
        
        Args:
            video_url (str): 비디오 URL
            
        Returns:
            dict: {
                'video_id': str,
                'embed_url': str,
                'platform': str
            }
        """
        pass