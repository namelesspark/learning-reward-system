// 메시지 전송
async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();

    if (!message) return;

    // 사용자 메시지 표시
    addChatMessage('user', message);
    input.value = '';

    // 로딩 메시지
    const loadingId = addChatMessage('assistant', '<div class="loading-dots"><span></span><span></span><span></span></div>', true);

    try {
        const data = await sendChatMessage(message);

        if (data.success) {
            // 로딩 메시지 제거
            removeMessage(loadingId);
            // 응답 표시
            addChatMessage('assistant', data.response);
        }
    } catch (error) {
        removeMessage(loadingId);
        addChatMessage('assistant', '오류가 발생했습니다: ' + error.message);
    }
}

// 채팅 메시지 추가
function addChatMessage(role, content, isLoading = false) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageId = 'msg_' + Date.now();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.id = messageId;
    if (isLoading) {
        messageDiv.classList.add('loading');
    }
    
    messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    return messageId;
}

// 메시지 제거
function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}