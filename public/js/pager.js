// Auto-detect API URL based on current domain
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : `${window.location.protocol}//${window.location.host}/api`;

let currentUser = null;
let typingText = '';
let messageCards = [];
let refreshInterval = null;

// Audio Context for custom beep sounds
let audioContext;
let beepSound;
let sendSound;

document.addEventListener('DOMContentLoaded', () => {
    initializeAudio();
    initializeApp();
});

// ============== KAOMOJI LIBRARY ==============

const KAOMOJI_LIBRARY = {
    "Happy": [
        "(◕‿◕)", "( ͡° ͜ʖ ͡°)", "(｡◕‿◕｡)", "ヽ(◕‿◕)ﾉ", "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧",
        "٩(◕‿◕｡)۶", "ʘ‿ʘ", "(✿◠‿◠)", "(◠‿◠✿)", "(*^‿^*)",
        "(＾▽＾)", "(⌒‿⌒)", "ღ(◕‿◕ღ)", "(◕ω◕)", "☆*:.｡.o(≧▽≦)o.｡.:*☆"
    ],
    "Love": [
        "(♥ω♥)", "♥‿♥", "(｡♥‿♥｡)", "(*♡∀♡)", "(✿ ♥‿♥)",
        "( ˘ ³˘)♥", "(´∀｀)♡", "ヽ(♡‿♡)ノ", "♥(ˆ⌣ˆԅ)", "(｡♥‿♥｡)",
        "≧◡≦", "❤(ɔˆ ³(ˆ⌣ˆc)", "(｡・//ε//・｡)", "♡(˃͈ દ ˂͈ ༶ )", "( ˘ ³˘)♥"
    ],
    "Sad": [
        "(╥_╥)", "(╯︵╰,)", "(ಥ﹏ಥ)", "(；′⌒`)", "(个_个)",
        "(｡•́︿•̀｡)", "(｡T ω T｡)", "(っ˘̩╭╮˘̩)っ", "｡ﾟ(ﾟ´Д｀ﾟ)ﾟ｡", "(つω⊂*)",
        "(T_T)", "(ToT)", "ಥ_ಥ", "(｡╯︵╰｡)", "｡･ﾟﾟ*(>д<)*ﾟﾟ･｡"
    ],
    "Angry": [
        "(╬ಠ益ಠ)", "(¬_¬)", "(ಠ_ಠ)", "(⋋▂⋌)", "(¬‿¬)",
        "ಠ_ರೃ", "(ง'̀-'́)ง", "(ಠ⌣ಠ)", "(ノಠ益ಠ)ノ彡┻━┻", "凸(⊙▂⊙✖ )",
        "(ﾒ` ﾛ ´)", "(╯°□°）╯︵ ┻━┻", "ლ(ಠ益ಠლ)", "(ノ ゜Д゜)ノ ︵ ┻━┻", "ヽ(ｏ`皿′ｏ)ﾉ"
    ],
    "Confused": [
        "(・・?)", "ಠ_ಠ", "(¬_¬ )", "(◎_◎;)", "ლ(ಠ_ಠლ)",
        "¯\\_(ツ)_/¯", "(´･_･`)", "(-_-?)", "(・_・ヾ", "ಠ~ಠ",
        "(ー_ー;)", "(-_-;)・・・", "(^～^;)ゞ", "(-.-;)", "(´-ω-`)"
    ],
    "Excited": [
        "ヽ(^o^)ノ", "＼(＾O＾)／", "ヽ(*⌒▽⌒*)ﾉ", "o(≧▽≦)o", "ヽ(' ∇' )ノ",
        "＼(^ω^＼)", "ヾ(｡･ω･｡)", "＼(≧▽≦)／", "٩(｡•́‿•̀｡)۶", "ヽ(♡‿♡)ノ",
        "✧*｡٩(ˊᗜˋ*)و✧*｡", "٩(˘◡˘)۶", "ヾ(⌐■_■)ノ♪", "~(˘▾˘~)", "(~˘▾˘)~"
    ],
    "Surprise": [
        "(⊙_⊙)", "(◎_◎)", "Σ(O_O)", "Σ(°△°|||)︴", "(o_O)",
        "(°o°)", "o_O", "ლ(⁰⊖⁰ლ)", "Σ(￣□￣||)", "(⊙ω⊙)",
        "꒰⊙ω⊙A꒱", "°o°", "ヾ(゜0゜*)ノ", "⊙▂⊙", "(✪㉨✪)"
    ],
    "Shy": [
        "(⁄ ⁄•⁄ω⁄•⁄ ⁄)", "(*ﾉωﾉ)", "(/ω＼)", "(∗•ω•∗)", "(✿ ♥‿♥)",
        "(*´∀｀*)", "(*ﾟｰﾟ)", "(灬ºωº灬)", "(*°∀°)", "(*/▽＼*)",
        "(/▽＼)", "(⁄˘⁄ ⁄ ω⁄ ⁄ ˘⁄)♡", "(*/ω＼*)", "o(*////▽////*)q", "(*ﾟｰﾟ)ゞ"
    ],
    "Cool": [
        "(⌐■_■)", "( ಠ ͜ʖರೃ)", "(▀̿Ĺ̯▀̿ ̿)", "¯\\(°_o)/¯", "(ง ͠° ͟ل͜ ͡°)ง",
        "ᕙ(⇀‸↼‶)ᕗ", "(ಠ_ಠ)┌", "└( ＾ω＾)」", "(•_•)", "( •_•)>⌐■-■",
        "ᕦ(ò_óˇ)ᕤ", "ᕙ(˵ ಠ ਊ ಠ ˵)ᕗ", "щ(゜ロ゜щ)", "ᕦ(ò_óˇ)ᕤ", "(•̀ᴗ•́)و"
    ],
    "Sleepy": [
        "(−_−)zzZ", "(ᴗ˳ᴗ)", "(⊃｡•́‿•̀｡)⊃", "(つ▀¯▀)つ", "(´～`)",
        "(-ω-)", "(*-ω-)", "(_ _)zzZ", "(-.-)Zzz...", "(－‸ლ)",
        "˘o˘", "(∪｡∪)｡｡｡zzZ", "(-ω-、)", "(눈_눈)", "( ˘ω˘ )zzZ"
    ],
    "Cute": [
        "(｡◕‿◕｡)", "(◕ᴗ◕✿)", "(✿◠‿◠)", "ʕ•ᴥ•ʔ", "(◕‿◕✿)",
        "ฅ(•ㅅ•❀)ฅ", "ʕ·ᴥ·ʔ", "(=^･ω･^=)", "ฅ(ﾐ⚈ ﻌ ⚈ﾐ)ฅ", "ᕙ(⇀‸↼‶)ᕗ",
        "( ´•̥̥̥ω•̥̥̥` )", "꒰｡•ॢ◡-ॢ｡꒱", "(⁎⁍̴̛ᴗ⁍̴̛⁎)", "ʕ •ᴥ•ʔゝ☆", "ʕっ•ᴥ•ʔっ"
    ],
    "Dancing": [
        "♪┏(・o･)┛♪", "♪┗ ( ･o･) ┓♪", "┌(˘⌣˘)ʃ", "ƪ(˘⌣˘)ʃ", "ヾ(⌐■_■)ノ♪",
        "└|∵|┐", "┌|∵|┘", "♪(┌・。・)┌", "♪ヽ(･ˇ∀ˇ･ゞ)", "ヾ(-_- )ゞ",
        "~(‾▿‾~)", "(~‾▿‾)~", "┏(^0^)┛", "┗(^0^)┓", "└(^o^)┘"
    ],
    "Fight": [
        "(ง'̀-'́)ง", "ᕦ(ò_óˇ)ᕤ", "ლ(ಠ益ಠლ)", "ᕙ(⇀‸↼‶)ᕗ", "(ง •̀_•́)ง",
        "ᕦ(ò_óˇ)ᕤ", "୧((ಠ益ಠ╬))୨", "ᕙ(⇀‸↼‶)ᕗ", "( •̀ω•́ )σ", "✊( •̀ω•́ )✊",
        "ლ(｀ー´ლ)", "ლ(ಠ_ಠლ)", "╰(‵□′)╯", "o(>< )o", "＼(｀0´)／"
    ],
    "Animals": [
        "ʕ•ᴥ•ʔ", "ฅ^•ﻌ•^ฅ", "▼・ᴥ・▼", "∪･ω･∪", "◖⚆ᴥ⚆◗",
        "ʕ·ᴥ·ʔ", "ʕ￫ᴥ￩ʔ", "ʕ •`ᴥ•´ʔ", "૮₍ ˃ ⤙ ˂ ₎ა", "ฅ(⌯͒• ɪ •⌯͒)ฅ❣",
        "(=^･ω･^=)", "ฅ(ﾐ⚈ ﻌ ⚈ﾐ)ฅ", "∪￣ω￣∪", "（ ´･ω･｀)", "ᘛ⁐̤ᕐᐷ"
    ],
    "Special": [
        "♪～(´ε｀ )", "☆*:.｡.o(≧▽≦)o.｡.:*☆", "✧*｡٩(ˊᗜˋ*)و✧*｡", "ヽ(•‿•)ノ", "╰(*´︶`*)╯",
        "♡〜٩(^▿^)۶〜♡", "✧◝(⁰▿⁰)◜✧", "°˖✧◝(⁰▿⁰)◜✧˖°", "♪(´ε｀ )", "(っ^▿^)۶🍸🌟🍺٩(˘◡˘ )",
        "＼(￣▽￣)／", "ヽ(' ∇' )ノ", "ヾ(｡･ω･)ｼ", "(*^3^)/~☆", "（*＾-＾*）"
    ]
};

// ============== NOTIFICATION SYSTEM ==============

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
    
    // Play sound
    if (type === 'error') {
        playBeep(400, 100);
    } else {
        playBeep(1000, 100);
    }
}

// ============== AUDIO SYSTEM ==============

function initializeAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playBeep(frequency = 800, duration = 50) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

function playSendSound() {
    // Multi-tone send confirmation sound
    setTimeout(() => playBeep(600, 100), 0);
    setTimeout(() => playBeep(800, 100), 100);
    setTimeout(() => playBeep(1000, 150), 200);
}

// ============== INITIALIZATION ==============

function initializeApp() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showLoginModal();
    }
}

// ============== LOGIN & REGISTRATION ==============

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const mainApp = document.getElementById('mainApp');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    loginModal.style.display = 'flex';
    mainApp.style.display = 'none';

    // 登录回车键处理
    const handleKeypress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
        playBeep(700, 30);
    };

    usernameInput.addEventListener('keypress', handleKeypress);
    passwordInput.addEventListener('keypress', handleKeypress);

    loginBtn.onclick = handleLogin;
    registerBtn.onclick = handleRegister;

    async function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username) {
            showNotification('Please enter username', 'error');
            return;
        }
        
        if (!password) {
            showNotification('Please enter password', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                playSendSound();
                showMainApp();
            } else {
                showNotification(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Connection error. Please make sure the server is running', 'error');
        }
    }

    async function handleRegister() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username) {
            showNotification('Please enter username', 'error');
            return;
        }
        
        if (!password || password.length < 4) {
            showNotification('Password must be at least 4 characters', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                playSendSound();
                showMainApp();
            } else {
                showNotification(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Connection error. Please make sure the server is running', 'error');
        }
    }
}

function showMainApp() {
    const loginModal = document.getElementById('loginModal');
    const mainApp = document.getElementById('mainApp');
    const currentUsername = document.getElementById('currentUsername');
    const adminBtn = document.getElementById('adminBtn');

    loginModal.style.display = 'none';
    mainApp.style.display = 'block';
    currentUsername.textContent = currentUser.username;
    
    // Show admin button if user is admin
    if (currentUser.isAdmin) {
        adminBtn.style.display = 'inline-block';
    }

    initializePager();
    loadMessages();
    loadUnreadCount();
    
    // Refresh unread count and messages every 10 seconds
    // 清理旧的interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    refreshInterval = setInterval(() => {
        loadUnreadCount();
        loadMessages();
    }, 10000);
}

// ============== PAGER SYSTEM ==============

function initializePager() {
    const virtualInput = document.getElementById('virtualInput');
    const clearBtn = document.getElementById('clearBtn');
    const sendBtn = document.getElementById('sendBtn');
    const inboxBtn = document.getElementById('inboxBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminBtn = document.getElementById('adminBtn');
    
    // Hide old input if exists
    const oldInput = document.getElementById('typeInput');
    if (oldInput) oldInput.style.display = 'none';

    // Focus virtual input
    virtualInput.focus();
    
    // Track composition state for IME
    let isComposing = false;
    
    // Handle Chinese input composition
    virtualInput.addEventListener('compositionstart', () => {
        isComposing = true;
    });
    
    virtualInput.addEventListener('compositionend', (e) => {
        isComposing = false;
    });
    
    // Handle input changes
    virtualInput.addEventListener('input', (e) => {
        typingText = virtualInput.textContent || '';
        
        // Play beep for non-composing input
        if (!isComposing) {
            playBeep(800, 30);
        }
    });

    // Handle special keys
    virtualInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // 使用现代API插入换行
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode('\n'));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            playBeep(600, 50);
        }
    });

    // Clear button
    clearBtn.onclick = () => {
        typingText = '';
        virtualInput.textContent = '';
        virtualInput.focus();
        playBeep(500, 100);
    };

    // Send button
    sendBtn.onclick = showSendModal;

    // Inbox button
    inboxBtn.onclick = showInboxModal;
    
    // Kaomoji button
    const kaomojiBtn = document.getElementById('kaomojiBtn');
    if (kaomojiBtn) {
        kaomojiBtn.onclick = showKaomojiLibrary;
    }
    
    // Admin button
    if (adminBtn) {
        adminBtn.onclick = showAdminPanel;
    }

    // Logout button
    logoutBtn.onclick = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            currentUser = null;
            location.reload();
        }
    };

    // Click anywhere to refocus (防止重复绑定)
    const handleGlobalClick = (e) => {
        if (!e.target.closest('.modal-content') && !e.target.closest('.message-card')) {
            virtualInput.focus();
        }
    };
    
    // 移除旧的监听器
    document.removeEventListener('click', handleGlobalClick);
    document.addEventListener('click', handleGlobalClick);
}

// ============== MESSAGE CARDS ==============

async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/notes/received/${currentUser.id}`);
        const notes = await response.json();

        // Get existing card IDs
        const existingCardIds = new Set(messageCards.map(c => c.id));

        // Add new messages as cards
        notes.forEach(note => {
            if (!existingCardIds.has(note.id)) {
                createMessageCard(note);
            }
        });
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function createMessageCard(note) {
    const canvas = document.getElementById('canvas');
    const card = document.createElement('div');
    card.className = 'message-card';
    card.dataset.noteId = note.id;

    // Random position
    const x = Math.random() * (window.innerWidth - 400) + 50;
    const y = Math.random() * (window.innerHeight - 300) + 50;
    card.style.left = x + 'px';
    card.style.top = y + 'px';

    // Card structure (使用textContent防止XSS)
    const closeBtn = document.createElement('button');
    closeBtn.className = 'card-close';
    closeBtn.textContent = '×';
    
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const fromDiv = document.createElement('div');
    fromDiv.className = 'card-from';
    fromDiv.textContent = `FROM: ${note.fromUsername}`;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'card-time';
    timeDiv.textContent = new Date(note.createdAt).toLocaleTimeString();
    
    header.appendChild(fromDiv);
    header.appendChild(timeDiv);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'card-content';
    
    card.appendChild(closeBtn);
    card.appendChild(header);
    card.appendChild(contentDiv);
    canvas.appendChild(card);

    // Animate typing effect with cleanup
    const stopAnimation = animateTyping(contentDiv, note.content);

    // Mark as read
    markAsRead(note.id);

    // Make draggable with cleanup
    const cleanup = makeDraggable(card);

    // Close button
    closeBtn.onclick = async (e) => {
        e.stopPropagation();
        
        // Delete note from server
        try {
            const response = await fetch(`${API_URL}/notes/${note.id}?userId=${currentUser.id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                stopAnimation(); // 清理动画
                cleanup(); // 清理拖拽监听器
                card.remove();
                messageCards = messageCards.filter(c => c.id !== note.id);
                playBeep(400, 100);
                showNotification('Message deleted', 'success');
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to delete message', 'error');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            showNotification('Failed to delete message', 'error');
        }
    };

    // Store reference
    messageCards.push({ id: note.id, element: card, cleanup: () => {
        stopAnimation();
        cleanup();
    }});

    // Play notification sound
    setTimeout(() => playBeep(1200, 100), 100);
    setTimeout(() => playBeep(1000, 100), 250);
    
    // Flash LED
    flashLED();
}

function animateTyping(element, text, speed = 30) {
    let index = 0;
    element.textContent = '';

    const interval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index];
            playBeep(900 + Math.random() * 200, 20);
            index++;
        } else {
            clearInterval(interval);
        }
    }, speed);
    
    // 返回清理函数
    return () => clearInterval(interval);
}

function makeDraggable(element) {
    let isDragging = false;
    let startX;
    let startY;
    let offsetX = 0;
    let offsetY = 0;

    function dragStart(e) {
        if (e.target.closest('.card-close')) return;
        
        if (e.target === element || e.target.closest('.card-header')) {
            isDragging = true;
            startX = e.clientX - offsetX;
            startY = e.clientY - offsetY;
            element.classList.add('dragging');
            element.style.zIndex = 1000;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;
            
            element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
    }

    function dragEnd() {
        if (isDragging) {
            isDragging = false;
            element.classList.remove('dragging');
            element.style.zIndex = 10;
            
            // Update final position
            const currentLeft = parseInt(element.style.left) || 0;
            const currentTop = parseInt(element.style.top) || 0;
            element.style.left = (currentLeft + offsetX) + 'px';
            element.style.top = (currentTop + offsetY) + 'px';
            element.style.transform = 'none';
            
            // Reset offsets
            offsetX = 0;
            offsetY = 0;
        }
    }

    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    // 返回清理函数
    return () => {
        element.removeEventListener('mousedown', dragStart);
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
    };
}

async function markAsRead(noteId) {
    try {
        await fetch(`${API_URL}/notes/${noteId}/read`, {
            method: 'PATCH'
        });
        loadUnreadCount();
    } catch (error) {
        console.error('Error marking as read:', error);
    }
}

function flashLED() {
    const led = document.getElementById('messageLed');
    led.classList.add('active');
    setTimeout(() => led.classList.remove('active'), 3000);
}

// ============== SEND MESSAGE ==============

async function showSendModal() {
    // 确保从虚拟输入获取最新内容
    const virtualInput = document.getElementById('virtualInput');
    if (virtualInput) {
        typingText = virtualInput.textContent || '';
    }
    
    if (!typingText.trim()) {
        showNotification('Please type a message first!', 'error');
        return;
    }

    const modal = document.getElementById('sendModal');
    const messagePreview = document.getElementById('messagePreview');
    const recipientSelect = document.getElementById('recipientSelect');
    const confirmSendBtn = document.getElementById('confirmSendBtn');

    messagePreview.textContent = typingText;

    // Load users
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();

        recipientSelect.innerHTML = '<option value="">SELECT RECIPIENT...</option>';
        users.forEach(user => {
            if (user.id !== currentUser.id) {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.username;
                recipientSelect.appendChild(option);
            }
        });

        if (users.length <= 1) {
            showNotification('No other users available. Please register another user in a different browser window.', 'error');
            return;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Failed to load user list', 'error');
        return;
    }

    modal.style.display = 'flex';
    
    // 保存消息内容副本，防止被意外清空
    const messageContent = typingText;

    confirmSendBtn.onclick = async () => {
        const toUserId = recipientSelect.value;

        if (!toUserId) {
            showNotification('Please select a recipient', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/notes/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromUserId: currentUser.id,
                    toUserId,
                    title: 'Message',
                    content: messageContent
                })
            });

            if (response.ok) {
                playSendSound();
                modal.style.display = 'none';
                
                // Clear typing area (虚拟输入系统)
                typingText = '';
                const virtualInput = document.getElementById('virtualInput');
                if (virtualInput) {
                    virtualInput.textContent = '';
                    virtualInput.focus();
                }
                
                showNotification('Message sent successfully!', 'success');
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to send message', 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('Failed to send message', 'error');
        }
    };

    setupModalClose(modal);
}

// ============== INBOX ==============

async function showInboxModal() {
    const modal = document.getElementById('inboxModal');
    const inboxList = document.getElementById('inboxList');

    modal.style.display = 'flex';
    inboxList.innerHTML = '<div class="empty-state">LOADING...</div>';

    try {
        const response = await fetch(`${API_URL}/notes/received/${currentUser.id}`);
        const notes = await response.json();

        if (notes.length === 0) {
            inboxList.innerHTML = '<div class="empty-state">NO MESSAGES</div>';
        } else {
            inboxList.innerHTML = '';
            notes.forEach(note => {
                const item = createMessageItem(note);
                inboxList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error loading inbox:', error);
        inboxList.innerHTML = '<div class="empty-state">ERROR LOADING</div>';
    }

    setupModalClose(modal);
}

function createMessageItem(note) {
    const div = document.createElement('div');
    div.className = 'message-item' + (!note.read ? ' unread' : '');

    const time = new Date(note.createdAt).toLocaleString();

    div.innerHTML = `
        <div class="message-header">
            <div class="message-from">${note.fromUsername}</div>
            ${!note.read ? '<div class="message-new">● NEW</div>' : ''}
        </div>
        <div class="message-time">${time}</div>
        <div class="message-preview-text">${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}</div>
    `;

    div.onclick = () => {
        showMessageDetail(note);
        playBeep(900, 50);
    };

    return div;
}

async function showMessageDetail(note) {
    const modal = document.getElementById('messageDetailModal');
    const messageDetail = document.getElementById('messageDetail');

    // Mark as read
    if (!note.read) {
        await markAsRead(note.id);
        note.read = true;
    }

    const time = new Date(note.createdAt).toLocaleString();

    // 使用 DOM API 创建元素，避免 XSS
    messageDetail.innerHTML = '';
    
    const header = document.createElement('div');
    header.className = 'message-detail-header';
    
    const fromDiv = document.createElement('div');
    fromDiv.className = 'message-detail-from';
    fromDiv.textContent = `FROM: ${note.fromUsername}`;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-detail-time';
    timeDiv.textContent = time;
    
    header.appendChild(fromDiv);
    header.appendChild(timeDiv);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-detail-content';
    contentDiv.textContent = note.content;
    
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    
    const showCardBtn = document.createElement('button');
    showCardBtn.className = 'pager-btn';
    showCardBtn.textContent = 'SHOW AS CARD';
    showCardBtn.onclick = () => createMessageCard(note);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'pager-btn';
    deleteBtn.style.cssText = 'background: #ff4444;';
    deleteBtn.textContent = 'DELETE';
    deleteBtn.onclick = async () => {
        if (!confirm('Delete this message?')) return;
        
        try {
            const response = await fetch(`${API_URL}/notes/${note.id}?userId=${currentUser.id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showNotification('Message deleted', 'success');
                closeMessageDetail();
                showInboxModal(); // Refresh inbox
                playBeep(400, 100);
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to delete message', 'error');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            showNotification('Failed to delete message', 'error');
        }
    };
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'pager-btn';
    closeBtn.textContent = 'CLOSE';
    closeBtn.onclick = closeMessageDetail;
    
    actions.appendChild(showCardBtn);
    actions.appendChild(deleteBtn);
    actions.appendChild(closeBtn);
    
    messageDetail.appendChild(header);
    messageDetail.appendChild(contentDiv);
    messageDetail.appendChild(actions);

    modal.style.display = 'flex';
    setupModalClose(modal);
}

function closeMessageDetail() {
    document.getElementById('messageDetailModal').style.display = 'none';
}

// ============== UTILITY FUNCTIONS ==============

async function loadUnreadCount() {
    try {
        const response = await fetch(`${API_URL}/notes/unread/${currentUser.id}`);
        const data = await response.json();
        const badge = document.getElementById('unreadCount');
        badge.textContent = data.unreadCount;
        badge.style.display = data.unreadCount > 0 ? 'flex' : 'none';
        
        if (data.unreadCount > 0) {
            flashLED();
        }
    } catch (error) {
        console.error('Error loading unread count:', error);
    }
}

function setupModalClose(modal) {
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            playBeep(500, 50);
        };
    }

    modal.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            playBeep(500, 50);
        }
    };
}

// ============== KAOMOJI LIBRARY MODAL ==============

function showKaomojiLibrary() {
    const modal = document.getElementById('kaomojiModal');
    const library = document.getElementById('kaomojiLibrary');
    
    modal.style.display = 'flex';
    library.innerHTML = '';
    
    // Render all kaomoji categories
    Object.keys(KAOMOJI_LIBRARY).forEach(category => {
        // Category header
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'kaomoji-category';
        categoryDiv.textContent = category;
        library.appendChild(categoryDiv);
        
        // Kaomoji items in this category
        KAOMOJI_LIBRARY[category].forEach(kaomoji => {
            const item = document.createElement('div');
            item.className = 'kaomoji-item';
            item.textContent = kaomoji;
            item.title = 'Click to insert';
            
            item.onclick = () => {
                insertKaomoji(kaomoji);
                modal.style.display = 'none';
                playBeep(1000, 50);
            };
            
            library.appendChild(item);
        });
    });
    
    setupModalClose(modal);
}

function insertKaomoji(kaomoji) {
    const virtualInput = document.getElementById('virtualInput');
    if (!virtualInput) return;
    
    // Insert kaomoji at cursor position or append to end
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    if (range && virtualInput.contains(range.commonAncestorContainer)) {
        // Insert at cursor position
        range.deleteContents();
        const textNode = document.createTextNode(kaomoji + ' ');
        range.insertNode(textNode);
        
        // Move cursor after inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        // Append to end
        virtualInput.textContent += kaomoji + ' ';
        
        // Move cursor to end
        const newRange = document.createRange();
        newRange.selectNodeContents(virtualInput);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
    
    // Update typingText
    typingText = virtualInput.textContent || '';
    
    // Focus back to input
    virtualInput.focus();
}

// ============== ADMIN PANEL ==============

async function showAdminPanel() {
    if (!currentUser.isAdmin) {
        showNotification('Admin privileges required', 'error');
        return;
    }

    const modal = document.getElementById('adminModal');
    const userList = document.getElementById('userList');

    modal.style.display = 'flex';
    userList.innerHTML = '<div class="empty-state">LOADING...</div>';

    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();

        userList.innerHTML = '';
        
        const header = document.createElement('div');
        header.style.cssText = 'margin-bottom: 20px; color: #00ff41; font-size: 14px;';
        header.textContent = `Total Users: ${users.length}`;
        userList.appendChild(header);

        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.style.cssText = 'margin: 10px 0; padding: 10px; background: rgba(0,255,65,0.1); border: 1px solid #00ff41; display: flex; justify-content: space-between; align-items: center;';
            
            const userInfo = document.createElement('div');
            userInfo.style.cssText = 'color: #00ff41;';
            userInfo.textContent = `${user.username}${user.id === currentUser.id ? ' (YOU)' : ''}`;
            
            if (user.id !== currentUser.id) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'pager-btn';
                deleteBtn.style.cssText = 'background: #ff4444; padding: 5px 15px; font-size: 12px;';
                deleteBtn.textContent = 'DELETE';
                deleteBtn.onclick = () => deleteUser(user.id, user.username);
                
                userItem.appendChild(userInfo);
                userItem.appendChild(deleteBtn);
            } else {
                userItem.appendChild(userInfo);
            }
            
            userList.appendChild(userItem);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        userList.innerHTML = '<div class="empty-state">ERROR LOADING</div>';
    }

    setupModalClose(modal);
}

async function deleteUser(userId, username) {
    if (!confirm(`Delete user "${username}"? This will also delete all their messages.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/${userId}?adminId=${currentUser.id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(`User "${username}" has been deleted`, 'success');
            playBeep(400, 100);
            showAdminPanel(); // Refresh the list
        } else {
            showNotification(data.error || 'Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Failed to delete user', 'error');
    }
}
