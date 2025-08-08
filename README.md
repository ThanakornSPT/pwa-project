# 🌟 Good Vibes Tracker PWA - Phase 1

A Progressive Web App for tracking daily mood and energy levels.

## 📱 Phase 1 Features

- **Daily Mood Tracking**: Track your energy levels from 1-10
- **Visual Feedback**: Emoji and color-coded mood display
- **Optional Notes**: Add context to your mood entries
- **Today's History**: View all mood entries for today
- **Basic Statistics**: See your mood patterns
- **PWA Features**: Install on home screen, works offline

## 🚀 Quick Start

1. **Run the setup script:**
   ```bash
   chmod +x setup-phase1.sh
   ./setup-phase1.sh
   ```

2. **Start local server:**
   ```bash
   cd goodvibes-tracker-phase1
   python3 -m http.server 8000
   ```

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

4. **Install as PWA:**
   - Look for "Install" prompt
   - Or use browser menu → "Add to Home Screen"

## 📁 Project Structure

```
goodvibes-tracker-phase1/
├── index.html                 # Main app page
├── manifest.json             # PWA configuration
├── sw.js                     # Service Worker
├── css/
│   └── app.css              # All styles
├── js/
│   ├── app.js               # AngularJS app setup
│   ├── controllers/
│   │   └── mood.controller.js # Mood tracking logic
│   ├── services/
│   │   └── storage.service.js # LocalStorage management
│   └── components/
│       └── install-prompt.js  # PWA install handling
├── assets/
│   ├── icons/               # PWA icons (create manually)
│   ├── sounds/              # Future: notification sounds
│   └── images/              # Future: app images
└── README.md                # This file
```

## 🔧 Technology Stack

- **Frontend**: AngularJS 1.8.2
- **Styling**: Pure CSS3 (Mobile-first)
- **Storage**: LocalStorage API
- **PWA**: Service Worker + Web App Manifest
- **Offline**: Cache-first strategy

## 📊 Data Storage

All data is stored locally in the browser using LocalStorage:

```javascript
// Data structure
{
  "goodvibes_mood_entries_2024-01-01": [
    {
      "id": "mood_1704067200000_abc123",
      "level": 7,
      "note": "Feeling great after morning coffee!",
      "timestamp": "2024-01-01T08:00:00.000Z",
      "time": "08:00"
    }
  ]
}
```

## 🎨 Icons Required

Create these icon files in `assets/icons/`:
- icon-72x72.png (maskable)
- icon-96x96.png
- icon-128x128.png
- icon-192x192.png (main)
- icon-512x512.png (large)

Use PWA icon generators or design tools to create consistent icons with Good Vibes branding.

## 📱 Testing

**Manual Testing Checklist:**
- [ ] App loads on mobile browsers
- [ ] Mood slider works with touch
- [ ] Can save mood entries
- [ ] Entries persist after page reload
- [ ] PWA install prompt appears
- [ ] Works offline after initial load
- [ ] Responsive design on all screen sizes

## 🚀 Deployment

For production deployment:

1. **Static Hosting** (Recommended):
   - Netlify, Vercel, GitHub Pages
   - Just upload all files to hosting service

2. **Custom Domain**:
   - Ensure HTTPS (required for PWA)
   - Update manifest.json URLs if needed

3. **PWA Store Submission**:
   - Microsoft Store (PWA support)
   - Samsung Galaxy Store
   - Chrome Web Store

## 🔜 Future Phases

- **Phase 2**: UI Components & Navigation
- **Phase 3**: Enhanced Data Management  
- **Phase 4**: Habits Tracking
- **Phase 5**: Gratitude Journal
- **Phase 6**: Meditation Timer
- **Phase 7**: Goals & Analytics
- **Phase 8**: Polish & Advanced Features

## 🤝 Contributing

This is Phase 1 - basic mood tracking only. 
Future enhancements will be added in subsequent phases.

## 📄 License

MIT License - Feel free to use and modify for personal or commercial projects.

---

## 💡 Usage Tips

1. **Regular Tracking**: Check in with your mood 2-3 times daily
2. **Add Notes**: Context helps identify patterns
3. **Install PWA**: Better experience with home screen icon
4. **Offline Use**: Works without internet after first load
5. **Data Export**: Use browser dev tools to backup localStorage

**Happy mood tracking! 🌈✨**
