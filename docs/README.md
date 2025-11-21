# Motorola Pager - Retro Message Board 📟

A nostalgic Motorola-style pager application where messages appear as draggable cards with typewriter animation effects. Experience the charm of 90s technology reimagined!

## Features

- 📟 **Motorola Pager Interface** - Authentic 90s pager design with LCD screen and LED indicator
- 💌 **Message Cards** - Received messages appear as floating cards on the canvas
- ⌨️ **Typewriter Animation** - Messages animate character-by-character with typing sounds
- 🖱️ **Draggable Cards** - Click and drag message cards anywhere on the screen
- 🔊 **Dual Sound System** - Different beep sounds for typing and message transmission
- 👥 **User System** - Register and login with usernames
- 📬 **Live Inbox** - Real-time message notifications with LED flash
- 🎨 **Retro Green LCD** - Classic monochrome LCD screen aesthetic
- 🔋 **Auto-Refresh** - Messages and notifications update every 10 seconds

## Tech Stack

**Frontend:**
- Vanilla JavaScript
- HTML5 & CSS3
- Special Elite font for authentic typewriter feel

**Backend:**
- Node.js
- Express.js
- File-based JSON storage

## Installation

1. **Install Dependencies**

```bash
npm install
```

2. **Start the Server**

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

3. **Open the App**

Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### First Time Users

1. **Register** - Enter your ID name and click "REGISTER"
2. **Type Message** - Start typing on the LCD screen (typing creates beep sounds)
3. **Send Message** - Click "SEND" button, select recipient, and transmit
4. **Watch Magic** - Messages appear as animated cards on the canvas

### How to Use

**Typing:**
- Type directly on the pager LCD screen
- Press Enter for new lines
- Click "CLEAR" to erase current message

**Sending Messages:**
1. Type your message
2. Click "SEND" button
3. Select recipient from dropdown
4. Click "TRANSMIT" (plays confirmation sound)

**Receiving Messages:**
- Messages auto-appear as cards with typewriter animation
- LED flashes and beeps when new message arrives
- Cards display with sender name and timestamp
- Drag cards anywhere on the screen

**Managing Messages:**
- Click "INBOX" to view all messages
- Click any message to see details
- "SHOW AS CARD" creates a draggable card
- Click "✕" on card to remove it

### Controls

- **INBOX** - View all received messages (shows unread count badge)
- **SEND** - Transmit current message to another user
- **CLEAR** - Erase typing area
- **EXIT** - Logout from pager

## API Endpoints

### User Routes

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users` - Get all users

### Note Routes

- `POST /api/notes/send` - Send a note
- `GET /api/notes/received/:userId` - Get received notes
- `GET /api/notes/sent/:userId` - Get sent notes
- `PATCH /api/notes/:noteId/read` - Mark note as read
- `DELETE /api/notes/:noteId` - Delete a note
- `GET /api/notes/unread/:userId` - Get unread count

## Data Storage

All data is stored in JSON files in the `data/` directory:
- `users.json` - User accounts
- `notes.json` - All notes

## Development

The app uses:
- `localhost:3000` for the server
- CORS enabled for cross-origin requests
- LocalStorage for persisting user sessions

## Tips

- Your login session persists across browser refreshes
- Unread notes are highlighted in blue
- The unread count refreshes every 30 seconds
- Click on any note in your inbox or sent folder to view full details

## License

ISC

---

Enjoy your retro typewriting experience! 📝✨
