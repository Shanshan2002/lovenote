const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 常量配置
const MAX_USERNAME_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_TITLE_LENGTH = 100;

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Input sanitization functions
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/[<>]/g, '') // Basic XSS protection
        .substring(0, MAX_MESSAGE_LENGTH);
};

const sanitizeUsername = (input) => {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/[<>"'&]/g, '')
        .substring(0, MAX_USERNAME_LENGTH);
};

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Lovenote is running!' });
});

// Root API endpoint
app.get('/api', (req, res) => {
    res.status(200).json({ message: 'Lovenote API is running!', version: '1.0.0' });
});

// Data storage paths
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');

// Initialize data directory and files
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
}

// Helper functions
const readJSON = (filepath) => {
    try {
        const data = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading file:', error);
        return [];
    }
};

const writeJSON = (filepath, data) => {
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing file:', error);
        return false;
    }
};

// ============== USER ROUTES ==============

// Register new user
app.post('/api/users/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || username.trim() === '') {
        return res.status(400).json({ error: 'Username is required' });
    }
    
    if (!password || password.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    // 消毒和验证用户名
    const sanitizedUsername = sanitizeUsername(username);
    
    if (sanitizedUsername.length < 2) {
        return res.status(400).json({ error: 'Username must be at least 2 characters' });
    }
    
    if (sanitizedUsername.length > MAX_USERNAME_LENGTH) {
        return res.status(400).json({ error: `Username too long (max ${MAX_USERNAME_LENGTH} characters)` });
    }

    const users = readJSON(USERS_FILE);
    
    // Check if username already exists
    if (users.find(u => u.username.toLowerCase() === sanitizedUsername.toLowerCase())) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = {
        id: uuidv4(),
        username: sanitizedUsername,
        password: password, // In production, use bcrypt to hash passwords
        isAdmin: false,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);
    
    // 实时备份
    createBackup('user_register');

    res.status(201).json({ 
        message: 'User registered successfully',
        user: { id: newUser.id, username: newUser.username, isAdmin: newUser.isAdmin }
    });
});

// Login user
app.post('/api/users/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || username.trim() === '') {
        return res.status(400).json({ error: 'Username is required' });
    }
    
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    // 消毒用户名
    const sanitizedUsername = sanitizeUsername(username);

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.username.toLowerCase() === sanitizedUsername.toLowerCase());

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify password
    if (user.password !== password) {
        return res.status(401).json({ error: 'Incorrect password' });
    }

    res.json({ 
        message: 'Login successful',
        user: { id: user.id, username: user.username, isAdmin: user.isAdmin || false }
    });
});

// Get all users
app.get('/api/users', (req, res) => {
    const users = readJSON(USERS_FILE);
    const userList = users.map(u => ({ id: u.id, username: u.username }));
    res.json(userList);
});

// Delete user (Admin only)
app.delete('/api/users/:userId', (req, res) => {
    const { userId } = req.params;
    const { adminId } = req.query;
    
    if (!adminId) {
        return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    const users = readJSON(USERS_FILE);
    
    // Check if requester is admin
    const admin = users.find(u => u.id === adminId);
    if (!admin || !admin.isAdmin) {
        return res.status(403).json({ error: 'Admin privileges required' });
    }
    
    // Find user to delete
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Cannot delete yourself
    if (userId === adminId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    writeJSON(USERS_FILE, users);
    
    // Delete all notes from/to this user
    const notes = readJSON(NOTES_FILE);
    const filteredNotes = notes.filter(n => 
        n.fromUserId !== userId && n.toUserId !== userId
    );
    writeJSON(NOTES_FILE, filteredNotes);
    
    // 实时备份
    createBackup('user_deleted');
    
    res.json({ 
        message: 'User deleted successfully',
        deletedUser: { id: deletedUser.id, username: deletedUser.username }
    });
});

// ============== NOTE ROUTES ==============

// Send a note
app.post('/api/notes/send', (req, res) => {
    const { fromUserId, toUserId, content, title } = req.body;
    
    if (!fromUserId || !toUserId || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 消毒和验证内容
    const sanitizedContent = sanitizeInput(content);
    const sanitizedTitle = sanitizeInput(title || 'Untitled Note').substring(0, MAX_TITLE_LENGTH);
    
    if (sanitizedContent.length === 0) {
        return res.status(400).json({ error: 'Message content cannot be empty' });
    }
    
    if (sanitizedContent.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` });
    }

    const users = readJSON(USERS_FILE);
    const fromUser = users.find(u => u.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId);

    if (!fromUser || !toUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    const notes = readJSON(NOTES_FILE);
    
    const newNote = {
        id: uuidv4(),
        fromUserId,
        fromUsername: fromUser.username,
        toUserId,
        toUsername: toUser.username,
        title: sanitizedTitle,
        content: sanitizedContent,
        createdAt: new Date().toISOString(),
        read: false
    };

    notes.push(newNote);
    writeJSON(NOTES_FILE, notes);
    
    // 实时备份
    createBackup('message_sent');

    res.status(201).json({ 
        message: 'Note sent successfully',
        note: newNote
    });
});

// Get received notes for a user
app.get('/api/notes/received/:userId', (req, res) => {
    const { userId } = req.params;
    
    const notes = readJSON(NOTES_FILE);
    const receivedNotes = notes.filter(n => n.toUserId === userId);
    
    // Sort by date, newest first
    receivedNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(receivedNotes);
});

// Get sent notes by a user
app.get('/api/notes/sent/:userId', (req, res) => {
    const { userId } = req.params;
    
    const notes = readJSON(NOTES_FILE);
    const sentNotes = notes.filter(n => n.fromUserId === userId);
    
    // Sort by date, newest first
    sentNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(sentNotes);
});

// Mark note as read
app.patch('/api/notes/:noteId/read', (req, res) => {
    const { noteId } = req.params;
    
    const notes = readJSON(NOTES_FILE);
    const note = notes.find(n => n.id === noteId);
    
    if (!note) {
        return res.status(404).json({ error: 'Note not found' });
    }
    
    note.read = true;
    writeJSON(NOTES_FILE, notes);
    
    res.json({ message: 'Note marked as read', note });
});

// Delete a note
app.delete('/api/notes/:noteId', (req, res) => {
    const { noteId } = req.params;
    const { userId } = req.query;
    
    let notes = readJSON(NOTES_FILE);
    const noteIndex = notes.findIndex(n => n.id === noteId);
    
    if (noteIndex === -1) {
        return res.status(404).json({ error: 'Note not found' });
    }
    
    const note = notes[noteIndex];
    
    // Only allow deletion if user is sender or receiver
    if (note.fromUserId !== userId && note.toUserId !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this note' });
    }
    
    notes.splice(noteIndex, 1);
    writeJSON(NOTES_FILE, notes);
    
    res.json({ message: 'Note deleted successfully' });
});

// Get unread count for a user
app.get('/api/notes/unread/:userId', (req, res) => {
    const { userId } = req.params;
    
    const notes = readJSON(NOTES_FILE);
    const unreadCount = notes.filter(n => n.toUserId === userId && !n.read).length;
    
    res.json({ unreadCount });
});

// ============== SERVER ==============

// Start server (works for both local and Railway)
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════╗
║        LOVENOTE SERVER STARTED        ║
╚═══════════════════════════════════════╝

📍 Port:     ${PORT}
🌐 Railway:  Listening on 0.0.0.0:${PORT}
💕 Status:   Running
💾 Backup:   Auto-backup enabled
    `);
    
    // 启动时清理旧备份
    cleanOldBackups(10);
});

// Export for Vercel compatibility (if needed)
module.exports = app;
