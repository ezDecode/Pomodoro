// Background service worker for Pomodoro Timer Extension
class PomodoroBackground {
  constructor() {
    this.timer = null;
    this.currentSession = {
      timeLeft: 0,
      isRunning: false,
      isBreak: false,
      startTime: null
    };
    
    this.settings = {
      focusTime: 25,
      breakTime: 5,
      longBreakTime: 15
    };
    
    this.initializeListeners();
    this.loadSettings();
  }
  
  initializeListeners() {
    // Handle messages from popup and content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
    
    // Handle extension install/startup
    chrome.runtime.onStartup.addListener(() => {
      this.resetSession();
    });
    
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.showWelcomeNotification();
      }
      this.resetSession();
    });
    
    // Handle alarm events for notifications
    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });
  }
  
  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'timerStarted':
        this.startTimer(message.duration, message.isBreak);
        sendResponse({ success: true });
        break;
        
      case 'timerPaused':
        this.pauseTimer();
        sendResponse({ success: true });
        break;
        
      case 'timerReset':
        this.resetSession();
        sendResponse({ success: true });
        break;
        
      case 'sessionComplete':
        this.handleSessionComplete(message.isBreak, message.sessionCount);
        sendResponse({ success: true });
        break;
        
      case 'getTimerState':
        sendResponse(this.currentSession);
        break;
        
      case 'updateSettings':
        this.updateSettings(message.settings);
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }
  
  startTimer(duration, isBreak) {
    this.currentSession = {
      timeLeft: duration,
      isRunning: true,
      isBreak: isBreak,
      startTime: Date.now(),
      totalDuration: duration
    };
    
    // Set up background timer
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    this.timer = setInterval(() => {
      this.currentSession.timeLeft--;
      
      // Update badge with remaining time
      this.updateBadge();
      
      if (this.currentSession.timeLeft <= 0) {
        this.completeSession();
      }
    }, 1000);
    
    // Set alarm as backup
    chrome.alarms.create('pomodoroTimer', {
      delayInMinutes: duration / 60
    });
    
    // Update badge immediately
    this.updateBadge();
  }
  
  pauseTimer() {
    this.currentSession.isRunning = false;
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    chrome.alarms.clear('pomodoroTimer');
    this.updateBadge();
  }
  
  resetSession() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    chrome.alarms.clear('pomodoroTimer');
    
    this.currentSession = {
      timeLeft: this.settings.focusTime * 60,
      isRunning: false,
      isBreak: false,
      startTime: null
    };
    
    this.updateBadge();
  }
  
  completeSession() {
    this.pauseTimer();
    
    const wasBreak = this.currentSession.isBreak;
    
    // Show notification
    this.showSessionCompleteNotification(wasBreak);
    
    // Play notification sound (if available)
    this.playNotificationSound();
    
    // Send message to popup if it's open
    chrome.runtime.sendMessage({
      action: 'sessionComplete'
    }).catch(() => {
      // Popup might not be open, that's okay
    });
    
    // Reset for next session
    this.resetSession();
  }
  
  handleAlarm(alarm) {
    if (alarm.name === 'pomodoroTimer') {
      this.completeSession();
    }
  }
  
  updateBadge() {
    if (this.currentSession.isRunning && this.currentSession.timeLeft > 0) {
      const minutes = Math.ceil(this.currentSession.timeLeft / 60);
      chrome.action.setBadgeText({
        text: minutes.toString()
      });
      chrome.action.setBadgeBackgroundColor({
        color: this.currentSession.isBreak ? '#4299e1' : '#f56565'
      });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
  
  showSessionCompleteNotification(wasBreak) {
    const title = wasBreak ? '🎉 Break Complete!' : '🍅 Focus Session Complete!';
    const message = wasBreak ? 
      'Time to get back to work and stay productive!' : 
      'Great job! Time for a well-deserved break.';
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: title,
      message: message,
      priority: 2,
      requireInteraction: true
    });
  }
  
  showWelcomeNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: '🍅 Welcome to Pomodoro Timer!',
      message: 'Click the extension icon to start your first focus session.',
      priority: 1
    });
  }
  
  playNotificationSound() {
    // Create an audio context and play a simple beep
    // Note: This might be limited in background scripts
    try {
      chrome.offscreen?.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Play notification sound for Pomodoro sessions'
      }).then(() => {
        chrome.runtime.sendMessage({
          target: 'offscreen',
          action: 'playNotificationSound'
        });
      }).catch(() => {
        // Offscreen API not available, skip sound
      });
    } catch (error) {
      // Audio playback not available in this context
      console.log('Audio playback not available in background script');
    }
  }
  
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }
  
  saveSettings() {
    chrome.storage.local.set({
      pomodoroBackgroundSettings: this.settings
    });
  }
  
  loadSettings() {
    chrome.storage.local.get('pomodoroBackgroundSettings', (result) => {
      if (result.pomodoroBackgroundSettings) {
        this.settings = { ...this.settings, ...result.pomodoroBackgroundSettings };
      }
    });
  }
  
  // Handle tab updates to inject content script if needed
  handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
      // Inject content script for better integration
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(() => {
        // Script injection failed, that's okay
      });
    }
  }
}

// Initialize background service
const pomodoroBackground = new PomodoroBackground();

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  pomodoroBackground.handleTabUpdate(tabId, changeInfo, tab);
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  // Open the popup when notification is clicked
  chrome.action.openPopup().catch(() => {
    // If popup can't be opened, at least clear the notification
    chrome.notifications.clear(notificationId);
  });
});

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  // Handle connections to keep service worker active
});

// Handle context menu (if needed in future)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'pomodoroQuickStart',
    title: 'Start Pomodoro Timer',
    contexts: ['page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'pomodoroQuickStart') {
    chrome.action.openPopup();
  }
});

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = PomodoroBackground;
}