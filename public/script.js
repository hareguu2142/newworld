async function sendMessage() {
    const input = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    
    const message = input.value.trim();
    if (message === '') return;

    // 사용자 메시지 추가
    appendMessage('user', message);

    // AI 응답 요청
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });
        
        const responseText = await response.text(); // 응답을 텍스트로 받습니다.
        
        let data;
        try {
            data = JSON.parse(responseText); // JSON 파싱을 시도합니다.
        } catch (jsonError) {
            // JSON 파싱에 실패하면 전체 응답 텍스트를 출력합니다.
            console.error('서버 응답 (JSON이 아님):', responseText);
            throw new Error('서버에서 유효하지 않은 응답을 받았습니다.');
        }

        if (!response.ok) {
            throw new Error(data.error || '알 수 없는 API 오류');
        }
        
        // AI 응답 추가
        appendMessage('ai', data.response);
    } catch (error) {
        console.error('오류:', error);
        appendMessage('ai', `죄송합니다. 오류가 발생했어요: ${error.message}`);
    }

    input.value = '';
}

function appendMessage(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
