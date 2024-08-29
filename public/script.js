let chatHistory = [];

window.onload = function() {
    loadChatHistory();
}

function loadChatHistory() {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
        chatHistory = JSON.parse(storedHistory);
        chatHistory.forEach(msg => appendMessage(msg.sender, msg.content, msg.unpleasant));
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
            body: JSON.stringify({ message: userMessage }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'API 응답 오류');
        }

        const data = await response.json();
        
        if (data.response) {
            appendMessage('ai', data.response, data.unpleasant);
            chatHistory.push({sender: 'ai', content: data.response, unpleasant: data.unpleasant});
            updateUnpleasantMeter(data.unpleasant);
            saveChatHistory();
        } else {
            throw new Error('AI 응답이 비어있습니다.');
        }
    } catch (error) {
        console.error('오류:', error);
        appendMessage('ai', `죄송합니다. 오류가 발생했어요: ${error.message}`);
    }

    input.value = '';
}

function appendMessage(sender, message, unpleasant = null) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = message;
    if (unpleasant !== null) {
        const unpleasantIndicator = document.createElement('span');
        unpleasantIndicator.classList.add('unpleasant-indicator');
        unpleasantIndicator.textContent = `불쾌도: ${(unpleasant * 100).toFixed(1)}%`;
        messageElement.appendChild(unpleasantIndicator);
    }
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateUnpleasantMeter(unpleasant) {
    const meterFill = document.getElementById('meter-fill');
    const meterValue = document.getElementById('meter-value');
    const percentage = unpleasant * 100;
    meterFill.style.width = `${percentage}%`;
    meterValue.textContent = `${percentage.toFixed(1)}%`;

    if (percentage < 33) {
        meterFill.style.backgroundColor = '#4CAF50';
    } else if (percentage < 66) {
        meterFill.style.backgroundColor = '#FFA500';
    } else {
        meterFill.style.backgroundColor = '#FF0000';
    }

    updateScreenDarkness(unpleasant);
}

function updateScreenDarkness(unpleasant) {
    const overlay = document.getElementById('dark-overlay');
    const opacity = unpleasant * 0.5; // 최대 50%까지 어두워지도록 설정
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
}

function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function clearChat() {
    chatHistory = [];
    localStorage.removeItem('chatHistory');
    document.getElementById('chat-messages').innerHTML = '';
    updateUnpleasantMeter(0);
    updateScreenDarkness(0);
}

document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});