// Configure Tailwind
tailwind.config = {
    theme: {
        extend: {
            colors: {
                grokBlack: '#000000',
                grokDark: '#111111',
                grokGray: '#222222',
            }
        }
    }
};

// Main App Logic
document.addEventListener('DOMContentLoaded', () => {
    
    // --- State ---
    const state = {
        messages: [],
        apiKey: localStorage.getItem('grok_api_key') || '',
        isLoading: false
    };

    // --- Elements ---
    const els = {
        chatContainer: document.getElementById('chat-container'),
        userInput: document.getElementById('user-input'),
        sendBtn: document.getElementById('send-btn'),
        settingsModal: document.getElementById('settings-modal'),
        apiKeyInput: document.getElementById('api-key-input'),
        btns: {
            clear: document.getElementById('clear-btn'),
            settings: document.getElementById('settings-btn'),
            closeSettings: document.getElementById('close-settings-btn'),
            saveSettings: document.getElementById('save-settings-btn')
        }
    };

    // --- Initialization ---
    lucide.createIcons();
    els.userInput.style.minHeight = '56px';
    els.userInput.style.maxHeight = '120px';

    if (state.apiKey) {
        els.apiKeyInput.value = state.apiKey;
    } else {
        addSystemMessage("Welcome. Please click the settings icon to add your API Key.");
        toggleSettings(true);
    }

    if (state.messages.length === 0 && state.apiKey) {
        addSystemMessage("I am Grok. Ready.");
    }

    // --- Event Listeners ---
    els.btns.settings.onclick = () => toggleSettings(true);
    els.btns.closeSettings.onclick = () => toggleSettings(false);
    els.btns.saveSettings.onclick = saveSettings;
    els.btns.clear.onclick = clearHistory;
    els.sendBtn.onclick = handleSend;

    els.userInput.addEventListener('input', function() {
        this.style.height = '';
        this.style.height = this.scrollHeight + 'px';
    });

    els.userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // --- Functions ---

    function toggleSettings(show) {
        if (show) els.settingsModal.classList.remove('hidden');
        else els.settingsModal.classList.add('hidden');
    }

    function saveSettings() {
        const key = els.apiKeyInput.value.trim();
        if (key) {
            state.apiKey = key;
            localStorage.setItem('grok_api_key', key);
            toggleSettings(false);
            if (state.messages.length === 0) addSystemMessage("Key saved. Let's chat.");
        } else {
            alert("Key cannot be empty");
        }
    }

    function clearHistory() {
        if (confirm("Clear history?")) {
            els.chatContainer.innerHTML = '';
            state.messages = [];
            addSystemMessage("History cleared.");
        }
    }

    function addSystemMessage(text) {
        addMessage('system', text);
    }

    function addMessage(role, content) {
        const isUser = role === 'user';
        const msgDiv = document.createElement('div');
        msgDiv.className = `flex gap-4 max-w-3xl mx-auto ${isUser ? 'flex-row-reverse' : ''}`;
        
        const avatar = isUser 
            ? `<div class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0"><i data-lucide="user" class="w-4 h-4"></i></div>`
            : `<div class="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center shrink-0 font-mono font-bold">/</div>`;

        const bubbleClass = isUser 
            ? 'bg-white text-black' 
            : 'bg-[#111] border border-gray-800 text-gray-200';

        const parsedContent = (role === 'system' || role === 'user') ? content : marked.parse(content);

        msgDiv.innerHTML = `
            ${avatar}
            <div class="flex-1 rounded-2xl px-5 py-3 ${bubbleClass} shadow-sm">
                <div class="prose prose-invert text-sm md:text-base leading-relaxed max-w-none message-content">
                    ${isUser ? content : parsedContent}
                </div>
            </div>
        `;

        els.chatContainer.appendChild(msgDiv);
        lucide.createIcons();
        scrollToBottom();
        
        // Don't double add if we are streaming updates later
        if(role !== 'assistant' || content !== '') {
            state.messages.push({ role, content });
        }
        
        return msgDiv;
    }

    function scrollToBottom() {
        els.chatContainer.scrollTop = els.chatContainer.scrollHeight;
    }

    async function handleSend() {
        const text = els.userInput.value.trim();
        if (!text || state.isLoading) return;
        if (!state.apiKey) { toggleSettings(true); return; }

        els.userInput.value = '';
        els.userInput.style.height = 'auto';
        addMessage('user', text);
        state.isLoading = true;

        // Typing Indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = "flex gap-4 max-w-3xl mx-auto";
        typingDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center shrink-0 font-mono font-bold">/</div>
            <div class="bg-[#111] border border-gray-800 rounded-2xl px-5 py-4 flex items-center gap-1.5">
                <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
            </div>
        `;
        els.chatContainer.appendChild(typingDiv);
        scrollToBottom();

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${state.apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.href,
                    "X-Title": "Grok Web Client"
                },
                body: JSON.stringify({
                    model: "x-ai/grok-4.1-fast:free",
                    messages: state.messages.map(m => ({ 
                        role: m.role === 'system' ? 'assistant' : m.role, 
                        content: m.content 
                    })),
                    stream: true
                })
            });

            typingDiv.remove();
            
            const botMsgDiv = addMessage('assistant', '');
            const contentDiv = botMsgDiv.querySelector('.message-content');
            let rawContent = "";

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");
                
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);
                        if (data === "[DONE]") break;
                        try {
                            const json = JSON.parse(data);
                            const delta = json.choices[0]?.delta?.content || "";
                            rawContent += delta;
                            contentDiv.innerHTML = marked.parse(rawContent);
                            scrollToBottom();
                        } catch (e) {}
                    }
                }
            }
            state.messages.push({ role: 'assistant', content: rawContent });

        } catch (error) {
            typingDiv.remove();
            addSystemMessage(`Error: ${error.message}`);
        } finally {
            state.isLoading = false;
        }
    }
});
