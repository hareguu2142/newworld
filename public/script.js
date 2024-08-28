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
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API 응답 오류');
        }

        const data = await response.json();
        
        // AI 응답 추가
        appendMessage('ai', data.response);
    } catch (error) {
        console.error('오류:', error);
        appendMessage('ai', `죄송합니다. 오류가 발생했어요: ${error.message}`);
    }

    input.value = '';
}
