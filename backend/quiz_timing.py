import random

def generate_quiz_timestamps(duration, num_quizzes=5, min_interval=60):
    # 영상이 너무 짧으면 퀴즈 개수 조정
    if duration < min_interval * 4:
        print("⚠️  영상이 너무 짧아 퀴즈를 생성할 수 없습니다")
        return []
    
    max_quizzes = int(duration / min_interval) - 1
    actual_num_quizzes = min(num_quizzes, max_quizzes)
    
    if actual_num_quizzes <= 0:
        return []
    
    # 영상을 구간으로 나누기
    section_size = duration / actual_num_quizzes
    
    timestamps = []
    for i in range(actual_num_quizzes):
        # 각 구간에서 랜덤하게 선택
        section_start = int(i * section_size) + 240  # 처음 4분 제외
        section_end = int((i + 1) * section_size) - 30  # 마지막 30초 제외
        
        if section_start < section_end:
            timestamp = random.randint(section_start, section_end)
            timestamps.append(timestamp)
    
    timestamps.sort()
    
    print(f"🎲 퀴즈 타임스탬프 생성: {timestamps}")
    print(f"   영상 길이: {duration}초, 퀴즈 개수: {len(timestamps)}개")
    
    return timestamps


def format_timestamp(seconds):
    minutes = seconds // 60
    secs = seconds % 60
    return f"{minutes:02d}:{secs:02d}"


def get_quiz_schedule(duration, num_quizzes=5):
    timestamps = generate_quiz_timestamps(duration, num_quizzes)
    
    schedule = []
    for ts in timestamps:
        schedule.append({
            'timestamp': ts,
            'time_str': format_timestamp(ts),
            'completed': False
        })
    
    return schedule