let chatHistory = [];
const sessionId = Date.now().toString();

window.onload = function() {
    loadChatHistory();
}

function loadChatHistory() {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
        chatHistory = JSON.parse(storedHistory);
        chatHistory.forEach(msg => appendMessage(msg.sender, msg.content));
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
            body: JSON.stringify({ message: userMessage, chatHistory }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'API 응답 오류');
        }

        const data = await response.json();
        if (data.response) {
            appendMessage('ai', data.response);
            chatHistory.push({sender: 'ai', content: data.response});
            if (data.brightness !== null) {
                updateScreenDarkness(1 - data.brightness); // 밝기를 어둡기로 변환
            }
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

function updateScreenDarkness(brightness) {
    const darkness = 1 - brightness;
    const overlay = document.getElementById('dark-overlay');
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${darkness})`;
}

document.getElementById('brightness-slider').addEventListener('input', function(e) {
    const brightness = parseFloat(e.target.value);
    updateScreenDarkness(brightness);
});

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
            body: JSON.stringify({ message: userMessage, chatHistory }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'API 응답 오류');
        }

        const data = await response.json();
        if (data.response) {
            appendMessage('ai', data.response);
            chatHistory.push({sender: 'ai', content: data.response});
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

function appendMessage(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateScreenDarkness(darkness) {
    const overlay = document.getElementById('dark-overlay');
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${darkness})`;
}

function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function clearChat() {
    chatHistory = [];
    localStorage.removeItem('chatHistory');
    document.getElementById('chat-messages').innerHTML = '';
    updateScreenDarkness(0);
}

document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});