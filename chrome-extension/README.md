# 🍅 Pomodoro Timer Chrome Extension

A powerful and beautiful Chrome extension that helps you stay focused and productive using the Pomodoro Technique. Built with modern web technologies and following Chrome Extension Manifest V3 best practices.

## ✨ Features

- **🎯 Focus Sessions**: 25-minute focused work sessions
- **☕ Smart Breaks**: 5-minute breaks with long breaks every 4 sessions
- **🔔 Desktop Notifications**: Get notified when sessions complete
- **📊 Session Tracking**: Track your daily and total completed sessions
- **⚙️ Customizable Timers**: Adjust focus and break durations to your preference
- **🎨 Beautiful UI**: Modern, clean interface with smooth animations
- **⌨️ Keyboard Shortcuts**: Quick controls without leaving your workflow
- **🌐 Web Integration**: Floating timer indicator on all web pages
- **🎵 Audio Notifications**: Optional sound alerts for session completions

## 🚀 Installation

### Install from Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store (link coming soon)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" button
5. Select the `chrome-extension` folder from this project
6. The extension will appear in your extensions list

## 🎮 Usage

### Basic Operations
1. **Click the extension icon** in the Chrome toolbar to open the timer
2. **Click "Start"** to begin a 25-minute focus session
3. **Stay focused** until the session completes
4. **Take a break** when prompted
5. **Repeat** the cycle to build productive habits

### Keyboard Shortcuts
- `Ctrl/Cmd + Shift + P`: Toggle timer (start/pause)
- `Ctrl/Cmd + Shift + R`: Reset current session
- `Escape`: Close overlay notifications

### Settings
- **Focus Time**: Adjust from 1-60 minutes (default: 25 minutes)
- **Break Time**: Adjust from 1-30 minutes (default: 5 minutes)
- Settings are automatically saved and synced across sessions

### Web Page Integration
- A floating indicator appears on web pages when the timer is running
- Click the indicator to quickly access timer controls
- Overlay notifications help maintain focus during work sessions

## 🛠️ Technical Details

### Architecture
- **Manifest V3**: Uses the latest Chrome extension architecture
- **Service Worker**: Efficient background processing
- **Content Scripts**: Seamless web page integration
- **Local Storage**: Persistent settings and statistics

### Permissions
- `storage`: Save settings and session statistics
- `notifications`: Display desktop notifications
- `activeTab`: Integrate with current web page
- `host_permissions`: Content script injection

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main timer interface
├── popup.css             # Styling for popup
├── popup.js              # Timer logic and UI interactions
├── background.js         # Service worker for background tasks
├── content.js            # Web page integration script
├── icons/                # Extension icons
│   ├── icon-16.png      # Toolbar icon
│   ├── icon-32.png      # Extension management
│   ├── icon-48.png      # Extension management
│   └── icon-128.png     # Chrome Web Store
└── README.md            # This file
```

## 🎨 Customization

### Changing Timer Durations
Use the + and - buttons in the settings section of the popup to adjust:
- Focus session length (1-60 minutes)
- Break duration (1-30 minutes)

### Theme Customization
The extension uses a modern gradient theme with:
- Focus sessions: Red/orange gradient
- Break sessions: Blue gradient
- Smooth animations and transitions

## 📊 Statistics

Track your productivity with built-in statistics:
- **Today's Sessions**: Sessions completed today
- **Total Sessions**: All-time session count
- Statistics reset daily and persist across browser sessions

## 🔧 Development

### Prerequisites
- Google Chrome browser
- Basic knowledge of HTML, CSS, and JavaScript

### Development Setup
1. Clone this repository
2. Make your changes to the extension files
3. Go to `chrome://extensions/`
4. Click "Reload" on the extension to test changes
5. Test thoroughly before publishing

### Building for Production
1. Ensure all files are present and properly formatted
2. Test the extension in developer mode
3. Create icons in the required sizes (16x16, 32x32, 48x48, 128x128)
4. Package the extension for the Chrome Web Store

## 🤝 Contributing

We welcome contributions! Please feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📋 Roadmap

Planned features for future versions:
- [ ] Multiple timer presets
- [ ] Detailed productivity analytics
- [ ] Website blocking during focus sessions
- [ ] Team collaboration features
- [ ] Integration with productivity apps
- [ ] Custom notification sounds
- [ ] Dark/light theme toggle

## 🐛 Bug Reports

Found a bug? Please create an issue with:
- Chrome version
- Extension version
- Steps to reproduce
- Expected vs actual behavior

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by the Pomodoro Technique® created by Francesco Cirillo
- Built with modern web technologies and Chrome Extension APIs
- Icons and design inspired by Material Design principles

---

**Happy focusing! 🍅**

*Remember: The Pomodoro Technique is a time management method that uses a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks.*