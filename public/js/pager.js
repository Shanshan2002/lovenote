// Auto-detect API URL based on current domain
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `${window.location.protocol}//${window.location.host}/api`;

let currentUser = null;
let typingText = '';
let messageCards = [];

// Audio Context for custom beep sounds
let audioContext;
let beepSound;
let sendSound;

document.addEventListener('DOMContentLoaded', () => {
    initializeAudio();
    initializeApp();
});

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
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    loginModal.style.display = 'flex';
    mainApp.style.display = 'none';

    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
        playBeep(700, 30);
    });

    loginBtn.onclick = handleLogin;
    registerBtn.onclick = handleRegister;

    async function handleLogin() {
        const username = usernameInput.value.trim();
        if (!username) {
            alert('Please enter a username');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (response.ok) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                playSendSound();
                showMainApp();
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Connection error. Please make sure the server is running.');
        }
    }

    async function handleRegister() {
        const username = usernameInput.value.trim();
        if (!username) {
            alert('Please enter a username');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (response.ok) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                playSendSound();
                showMainApp();
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Connection error. Please make sure the server is running.');
        }
    }
}

function showMainApp() {
    const loginModal = document.getElementById('loginModal');
    const mainApp = document.getElementById('mainApp');
    const currentUsername = document.getElementById('currentUsername');

    loginModal.style.display = 'none';
    mainApp.style.display = 'block';
    currentUsername.textContent = currentUser.username;

    initializePager();
    loadMessages();
    loadUnreadCount();
    
    // Refresh unread count and messages every 10 seconds
    setInterval(() => {
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
            // Insert line break manually
            document.execCommand('insertLineBreak');
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

    // Logout button
    logoutBtn.onclick = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            currentUser = null;
            location.reload();
        }
    };

    // Click anywhere to refocus
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.modal-content') && !e.target.closest('.message-card')) {
            virtualInput.focus();
        }
    });
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

    // Card structure
    card.innerHTML = `
        <button class="card-close">&times;</button>
        <div class="card-header">
            <div class="card-from">FROM: ${note.fromUsername}</div>
            <div class="card-time">${new Date(note.createdAt).toLocaleTimeString()}</div>
        </div>
        <div class="card-content"></div>
    `;

    canvas.appendChild(card);

    // Animate typing effect
    const contentDiv = card.querySelector('.card-content');
    animateTyping(contentDiv, note.content);

    // Mark as read
    markAsRead(note.id);

    // Make draggable
    makeDraggable(card);

    // Close button
    card.querySelector('.card-close').onclick = (e) => {
        e.stopPropagation();
        card.remove();
        messageCards = messageCards.filter(c => c.id !== note.id);
        playBeep(400, 100);
    };

    // Store reference
    messageCards.push({ id: note.id, element: card });

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
}

function makeDraggable(element) {
    let isDragging = false;
    let startX;
    let startY;
    let offsetX = 0;
    let offsetY = 0;

    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

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
    if (!typingText.trim()) {
        alert('Please type a message first!');
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
            alert('No other users available. Please register another user in a different browser window.');
            return;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Failed to load users');
        return;
    }

    modal.style.display = 'flex';

    confirmSendBtn.onclick = async () => {
        const toUserId = recipientSelect.value;

        if (!toUserId) {
            alert('Please select a recipient');
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
                    content: typingText
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
                
                alert('Message transmitted!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
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

    messageDetail.innerHTML = `
        <div class="message-detail-header">
            <div class="message-detail-from">FROM: ${note.fromUsername}</div>
            <div class="message-detail-time">${time}</div>
        </div>
        <div class="message-detail-content">${note.content}</div>
        <div class="message-actions">
            <button class="pager-btn" onclick="createMessageCard(${JSON.stringify(note).replace(/"/g, '&quot;')})">SHOW AS CARD</button>
            <button class="pager-btn" onclick="closeMessageDetail()">CLOSE</button>
        </div>
    `;

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
