let chatHistory = [];

// 페이지 로드 시 로컬 스토리지에서 대화 내용 불러오기
window.onload = function() {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
        chatHistory = JSON.parse(storedHistory);
        chatHistory.forEach(msg = appendMessage(msg.sender, msg.content));
    }
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (input.value.trim() === '') return;

    const userMessage = input.value;
    appendMessage('user', userMessage);
    chatHistory.push({sender: 'user', content: userMessage});

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage, history: chatHistory }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'API 응답 오류');
        }

        const data = await response.json();
        
        if (data.response) {
            appendMessage('ai', data.response);
            chatHistory.push({sender: 'ai', content: data.response});
            // 로컬 스토리지에 대화 내용 저장
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        } else {
            throw new Error('AI 응답이 비어있습니다.');
        }
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