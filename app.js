// Tailwind Config for custom colors
tailwind.config = {
    theme: {
        extend: {
            colors: {
                dark: '#050510',
                surface: '#11111b'
            }
        }
    }
};

const app = {
    state: {
        apiKey: localStorage.getItem('shadow_api_key') || '',
        username: localStorage.getItem('shadow_username') || '',
        sessions: JSON.parse(localStorage.getItem('shadow_sessions') || '{}'),
        currentSessionId: null,
        isLoading: false
    },

    init: function() {
        lucide.createIcons();
        this.setupEventListeners();

        // Check Login
        if (!this.state.username) {
            document.getElementById('login-screen').classList.remove('hidden');
        } else {
            document.getElementById('login-screen').classList.add('hidden');
            this.updateProfileUI();
            this.loadHistorySidebar();
            this.newChat(); // Start fresh or load last
        }

        // Setup API Key field if exists
        if (this.state.apiKey) document.getElementById('api-key-input').value = this.state.apiKey;
    },

    setupEventListeners: function() {
        const input = document.getElementById('user-input');
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });
    },

    // --- Auth & Settings ---
    login: function() {
        const name = document.getElementById('username-input').value.trim();
        if (name) {
            this.state.username = name;
            localStorage.setItem('shadow_username', name);
            document.getElementById('login-screen').classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => document.getElementById('login-screen').classList.add('hidden'), 500);
            this.updateProfileUI();
            this.loadHistorySidebar();
            this.newChat();
        }
    },

    logout: function() {
        if(confirm("Delete all history and reset?")) {
            localStorage.clear();
            location.reload();
        }
    },

    updateProfileUI: function() {
        document.getElementById('display-username').textContent = this.state.username;
        document.getElementById('settings-username').value = this.state.username;
        document.getElementById('user-avatar-initial').textContent = this.state.username.charAt(0).toUpperCase();
    },

    toggleSettings: function() {
        document.getElementById('settings-modal').classList.toggle('hidden');
    },

    saveSettings: function() {
        const key = document.getElementById('api-key-input').value.trim();
        const name = document.getElementById('settings-username').value.trim();
        
        if (name) {
            this.state.username = name;
            localStorage.setItem('shadow_username', name);
            this.updateProfileUI();
        }
        if (key) {
            this.state.apiKey = key;
            localStorage.setItem('shadow_api_key', key);
        }
        this.toggleSettings();
    },

    // --- Session Management ---
    generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),

    newChat: function() {
        this.state.currentSessionId = this.generateId();
        this.state.sessions[this.state.currentSessionId] = {
            title: "New Chat",
            messages: []
        };
        this.renderChatWindow();
        this.toggleSidebar(false); // Close mobile sidebar
        // Don't save to localstorage yet until first message
    },

    loadSession: function(id) {
        if (this.state.sessions[id]) {
            this.state.currentSessionId = id;
            this.renderChatWindow();
            this.toggleSidebar(false);
        }
    },

    saveSessionsToStorage: function() {
        localStorage.setItem('shadow_sessions', JSON.stringify(this.state.sessions));
        this.loadHistorySidebar();
    },

    loadHistorySidebar: function() {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        const ids = Object.keys(this.state.sessions).sort((a,b) => b.localeCompare(a)); // Newest first

        ids.forEach(id => {
            const session = this.state.sessions[id];
            const btn = document.createElement('button');
            btn.className = `w-full text-left px-4 py-3 rounded-xl text-sm truncate transition-colors ${id === this.state.currentSessionId ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`;
            btn.innerHTML = `<span class="truncate">${session.title}</span>`;
            btn.onclick = () => this.loadSession(id);
            list.appendChild(btn);
        });
    },

    toggleSidebar: function(force) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (force === false) {
            sidebar.classList.add('-translate-x-full');
        } else {
            sidebar.classList.toggle('-translate-x-full');
        }
    },

    // --- Chat Logic ---
    renderChatWindow: function() {
        const container = document.getElementById('chat-container');
        container.innerHTML = '';
        
        const session = this.state.sessions[this.state.currentSessionId];
        
        if (!session || session.messages.length === 0) {
            container.innerHTML = `
                <div id="empty-state" class="h-full flex flex-col items-center justify-center text-center opacity-50 p-6">
                    <div class="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-indigo-400">
                        <i data-lucide="ghost" class="w-8 h-8"></i>
                    </div>
                    <h2 class="text-xl font-bold text-gray-300">Hello, ${this.state.username}</h2>
                    <p class="text-sm text-gray-500 mt-2">I am ready to serve.</p>
                </div>`;
        } else {
            session.messages.forEach(msg => this.appendMessageToUI(msg.role, msg.content, false));
        }
        lucide.createIcons();
    },

    appendMessageToUI: function(role, content, animate = true) {
        document.getElementById('empty-state')?.remove();
        const container = document.getElementById('chat-container');
        const isUser = role === 'user';
        
        const div = document.createElement('div');
        div.className = `flex gap-4 max-w-3xl mx-auto ${isUser ? 'flex-row-reverse' : ''} ${animate ? 'msg-animate' : ''} mb-6`;
        
        const avatar = isUser 
            ? `<div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold">${this.state.username.charAt(0)}</div>`
            : `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20"><i data-lucide="ghost" class="w-4 h-4 text-white"></i></div>`;

        const bubbleStyle = isUser 
            ? 'bg-[#2b2b3b] text-white border border-white/5' 
            : 'bg-transparent text-gray-200';

        const parsed = (role === 'system' || role === 'user') ? content : marked.parse(content);

        div.innerHTML = `
            ${avatar}
            <div class="flex-1 min-w-0">
                <div class="text-[10px] text-gray-500 mb-1 ${isUser ? 'text-right' : 'text-left'}">${isUser ? 'You' : 'Shadow'}</div>
                <div class="rounded-2xl px-5 py-3 ${bubbleStyle} shadow-sm">
                    <div class="prose prose-invert text-sm md:text-base leading-relaxed max-w-none">
                        ${isUser ? content : parsed}
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(div);
        lucide.createIcons();
        container.scrollTop = container.scrollHeight;
        return div;
    },

    handleSend: async function() {
        const input = document.getElementById('user-input');
        const text = input.value.trim();
        
        if (!text || this.state.isLoading) return;
        if (!this.state.apiKey) { this.toggleSettings(); return; }

        input.value = '';
        input.style.height = 'auto';
        this.appendMessageToUI('user', text);
        
        // Update Session State
        const session = this.state.sessions[this.state.currentSessionId];
        session.messages.push({ role: 'user', content: text });
        
        // Update Title if first message
        if (session.messages.length === 1) {
            session.title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
            this.saveSessionsToStorage(); // Save title immediately
        }

        this.state.isLoading = true;

        // Typing Indicator
        const container = document.getElementById('chat-container');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = "flex gap-4 max-w-3xl mx-auto mb-6";
        typingDiv.innerHTML = `
             <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0"><i data-lucide="ghost" class="w-4 h-4 text-white"></i></div>
             <div class="bg-[#1e1e24] rounded-2xl px-4 py-3 flex items-center gap-1.5 border border-white/5">
                <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
             </div>
        `;
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;

        try {
            // Prepare context (Limit last 10 messages to save context window)
            const contextMessages = session.messages.slice(-10).map(m => ({
                role: m.role, content: m.content
            }));
            
            // Add System Prompt
            contextMessages.unshift({role: "system", content: "You are Shadow, a helpful and witty AI assistant."});

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.state.apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.href,
                    "X-Title": "Shadow GPT"
                },
                body: JSON.stringify({
                    model: "x-ai/grok-4.1-fast:free",
                    messages: contextMessages,
                    stream: true
                })
            });

            typingDiv.remove();
            
            // Create Placeholder for Bot Response
            const botMsgDiv = this.appendMessageToUI('assistant', '');
            const contentDiv = botMsgDiv.querySelector('.prose');
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
                            container.scrollTop = container.scrollHeight;
                        } catch (e) {}
                    }
                }
            }

            // Save Bot Response to Session
            session.messages.push({ role: 'assistant', content: rawContent });
            this.saveSessionsToStorage();

        } catch (error) {
            document.getElementById('typing-indicator')?.remove();
            this.appendMessageToUI('system', `Error: ${error.message}`);
        } finally {
            this.state.isLoading = false;
        }
    }
};

window.onload = () => app.init();
