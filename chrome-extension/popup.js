class PomodoroTimer {
  constructor() {
    this.settings = {
      focusTime: 25,
      breakTime: 5,
      longBreakTime: 15,
      sessionsUntilLongBreak: 4
    };
    
    this.state = {
      currentTime: 25 * 60, // seconds
      isRunning: false,
      currentSession: 1,
      isBreak: false,
      totalSessions: 0,
      todaySessions: 0
    };
    
    this.timer = null;
    this.totalSeconds = 25 * 60;
    
    this.initializeElements();
    this.loadSettings();
    this.loadStats();
    this.bindEvents();
    this.updateDisplay();
  }
  
  initializeElements() {
    // Timer display elements
    this.timeDisplay = document.getElementById('timeDisplay');
    this.timerType = document.getElementById('timerType');
    this.sessionCount = document.getElementById('sessionCount');
    this.progressCircle = document.getElementById('progressCircle');
    this.phaseDot = document.getElementById('phaseDot');
    
    // Control buttons
    this.startPauseBtn = document.getElementById('startPauseBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.skipBtn = document.getElementById('skipBtn');
    
    // Settings elements
    this.focusTimeElement = document.getElementById('focusTime');
    this.breakTimeElement = document.getElementById('breakTime');
    this.focusDecrease = document.getElementById('focusDecrease');
    this.focusIncrease = document.getElementById('focusIncrease');
    this.breakDecrease = document.getElementById('breakDecrease');
    this.breakIncrease = document.getElementById('breakIncrease');
    
    // Stats elements
    this.todayCount = document.getElementById('todayCount');
    this.totalCount = document.getElementById('totalCount');
  }
  
  bindEvents() {
    // Control buttons
    this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
    this.resetBtn.addEventListener('click', () => this.resetTimer());
    this.skipBtn.addEventListener('click', () => this.skipSession());
    
    // Settings buttons
    this.focusDecrease.addEventListener('click', () => this.adjustTime('focus', -1));
    this.focusIncrease.addEventListener('click', () => this.adjustTime('focus', 1));
    this.breakDecrease.addEventListener('click', () => this.adjustTime('break', -1));
    this.breakIncrease.addEventListener('click', () => this.adjustTime('break', 1));
  }
  
  toggleTimer() {
    if (this.state.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }
  
  startTimer() {
    this.state.isRunning = true;
    this.startPauseBtn.querySelector('.btn-text').textContent = 'Pause';
    document.body.classList.add('timer-running');
    
    this.timer = setInterval(() => {
      this.state.currentTime--;
      this.updateDisplay();
      
      if (this.state.currentTime <= 0) {
        this.completeSession();
      }
    }, 1000);
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'timerStarted',
      duration: this.state.currentTime,
      isBreak: this.state.isBreak
    });
  }
  
  pauseTimer() {
    this.state.isRunning = false;
    this.startPauseBtn.querySelector('.btn-text').textContent = 'Start';
    document.body.classList.remove('timer-running');
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    chrome.runtime.sendMessage({ action: 'timerPaused' });
  }
  
  resetTimer() {
    this.pauseTimer();
    this.state.currentTime = this.state.isBreak ? 
      this.settings.breakTime * 60 : this.settings.focusTime * 60;
    this.totalSeconds = this.state.currentTime;
    this.updateDisplay();
    
    chrome.runtime.sendMessage({ action: 'timerReset' });
  }
  
  skipSession() {
    this.completeSession();
  }
  
  completeSession() {
    this.pauseTimer();
    
    if (!this.state.isBreak) {
      // Completed a focus session
      this.state.totalSessions++;
      this.state.todaySessions++;
      this.state.currentSession++;
      
      // Determine break type
      const isLongBreak = this.state.currentSession % this.settings.sessionsUntilLongBreak === 0;
      const breakDuration = isLongBreak ? this.settings.longBreakTime : this.settings.breakTime;
      
      this.state.isBreak = true;
      this.state.currentTime = breakDuration * 60;
      this.totalSeconds = this.state.currentTime;
      
      this.showNotification('Focus session complete!', 'Time for a break 🎉');
      
    } else {
      // Completed a break session
      this.state.isBreak = false;
      this.state.currentTime = this.settings.focusTime * 60;
      this.totalSeconds = this.state.currentTime;
      
      this.showNotification('Break complete!', 'Time to focus 🍅');
    }
    
    this.saveStats();
    this.updateDisplay();
    
    chrome.runtime.sendMessage({
      action: 'sessionComplete',
      isBreak: this.state.isBreak,
      sessionCount: this.state.currentSession
    });
  }
  
  adjustTime(type, delta) {
    if (this.state.isRunning) return;
    
    if (type === 'focus') {
      this.settings.focusTime = Math.max(1, Math.min(60, this.settings.focusTime + delta));
      if (!this.state.isBreak) {
        this.state.currentTime = this.settings.focusTime * 60;
        this.totalSeconds = this.state.currentTime;
      }
    } else {
      this.settings.breakTime = Math.max(1, Math.min(30, this.settings.breakTime + delta));
      if (this.state.isBreak) {
        this.state.currentTime = this.settings.breakTime * 60;
        this.totalSeconds = this.state.currentTime;
      }
    }
    
    this.saveSettings();
    this.updateDisplay();
  }
  
  updateDisplay() {
    // Update time display
    const minutes = Math.floor(this.state.currentTime / 60);
    const seconds = this.state.currentTime % 60;
    this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update timer type
    this.timerType.textContent = this.state.isBreak ? 'Break Time' : 'Focus Time';
    
    // Update session count
    this.sessionCount.textContent = this.state.currentSession;
    
    // Update progress circle
    const progress = ((this.totalSeconds - this.state.currentTime) / this.totalSeconds) * 565.48;
    this.progressCircle.style.strokeDashoffset = 565.48 - progress;
    
    // Update phase indicator
    this.phaseDot.className = `phase-dot ${this.state.isRunning ? 'active' : ''}`;
    
    // Update body classes
    document.body.classList.toggle('timer-break', this.state.isBreak);
    
    // Update settings display
    this.focusTimeElement.textContent = this.settings.focusTime;
    this.breakTimeElement.textContent = this.settings.breakTime;
    
    // Update stats display
    this.todayCount.textContent = this.state.todaySessions;
    this.totalCount.textContent = this.state.totalSessions;
  }
  
  showNotification(title, message) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: 'icons/icon-48.png',
        requireInteraction: false
      });
    }
  }
  
  saveSettings() {
    chrome.storage.local.set({
      pomodoroSettings: this.settings
    });
  }
  
  loadSettings() {
    chrome.storage.local.get('pomodoroSettings', (result) => {
      if (result.pomodoroSettings) {
        this.settings = { ...this.settings, ...result.pomodoroSettings };
        this.state.currentTime = this.settings.focusTime * 60;
        this.totalSeconds = this.state.currentTime;
        this.updateDisplay();
      }
    });
  }
  
  saveStats() {
    const today = new Date().toDateString();
    chrome.storage.local.set({
      pomodoroStats: {
        totalSessions: this.state.totalSessions,
        lastDate: today,
        todaySessions: this.state.todaySessions
      }
    });
  }
  
  loadStats() {
    chrome.storage.local.get('pomodoroStats', (result) => {
      if (result.pomodoroStats) {
        const today = new Date().toDateString();
        const stats = result.pomodoroStats;
        
        this.state.totalSessions = stats.totalSessions || 0;
        
        // Reset today's count if it's a new day
        if (stats.lastDate !== today) {
          this.state.todaySessions = 0;
        } else {
          this.state.todaySessions = stats.todaySessions || 0;
        }
        
        this.updateDisplay();
      }
    });
  }
}

// Initialize the timer when popup opens
document.addEventListener('DOMContentLoaded', () => {
  // Request notification permission
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  // Initialize the Pomodoro timer
  window.pomodoroTimer = new PomodoroTimer();
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (window.pomodoroTimer) {
    switch (message.action) {
      case 'updateTimer':
        window.pomodoroTimer.state.currentTime = message.timeLeft;
        window.pomodoroTimer.updateDisplay();
        break;
      case 'sessionComplete':
        window.pomodoroTimer.completeSession();
        break;
    }
  }
});