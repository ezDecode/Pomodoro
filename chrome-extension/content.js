// Content script for Pomodoro Timer Extension
// Runs on all web pages to provide additional functionality

class PomodoroContentScript {
  constructor() {
    this.isTimerRunning = false;
    this.currentSession = null;
    this.overlayVisible = false;
    
    this.init();
  }
  
  init() {
    this.createTimerIndicator();
    this.setupMessageListener();
    this.setupKeyboardShortcuts();
    this.checkInitialTimerState();
  }
  
  createTimerIndicator() {
    // Create floating timer indicator
    this.indicator = document.createElement('div');
    this.indicator.id = 'pomodoro-indicator';
    this.indicator.innerHTML = `
      <div class="pomodoro-indicator-content">
        <div class="pomodoro-icon">🍅</div>
        <div class="pomodoro-time">25:00</div>
        <div class="pomodoro-status">Ready</div>
      </div>
    `;
    
    // Add styles
    this.addIndicatorStyles();
    
    // Add click handler
    this.indicator.addEventListener('click', () => {
      this.toggleTimerPopup();
    });
    
    // Add to page
    document.body.appendChild(this.indicator);
    
    // Initially hidden
    this.indicator.style.display = 'none';
  }
  
  addIndicatorStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #pomodoro-indicator {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      #pomodoro-indicator:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }
      
      .pomodoro-indicator-content {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      
      .pomodoro-icon {
        font-size: 18px;
      }
      
      .pomodoro-time {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      
      .pomodoro-status {
        font-size: 12px;
        opacity: 0.8;
      }
      
      #pomodoro-indicator.running {
        background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
        animation: pomodoroFloat 2s ease-in-out infinite;
      }
      
      #pomodoro-indicator.break {
        background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
      }
      
      @keyframes pomodoroFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      
      .pomodoro-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .pomodoro-overlay-content {
        text-align: center;
        padding: 40px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .pomodoro-overlay h2 {
        font-size: 48px;
        margin-bottom: 20px;
        font-weight: 700;
      }
      
      .pomodoro-overlay p {
        font-size: 18px;
        margin-bottom: 30px;
        opacity: 0.9;
      }
      
      .pomodoro-overlay button {
        background: #48bb78;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin: 0 10px;
        transition: all 0.2s ease;
      }
      
      .pomodoro-overlay button:hover {
        background: #38a169;
        transform: translateY(-1px);
      }
      
      .pomodoro-overlay button.secondary {
        background: transparent;
        border: 2px solid rgba(255, 255, 255, 0.3);
      }
      
      .pomodoro-overlay button.secondary:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    `;
    document.head.appendChild(style);
  }
  
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'timerStarted':
          this.handleTimerStarted(message.duration, message.isBreak);
          break;
        case 'timerPaused':
          this.handleTimerPaused();
          break;
        case 'timerReset':
          this.handleTimerReset();
          break;
        case 'sessionComplete':
          this.handleSessionComplete(message.isBreak);
          break;
        case 'updateTimer':
          this.updateTimerDisplay(message.timeLeft, message.isBreak);
          break;
      }
    });
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + Shift + P to toggle timer
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        this.toggleTimer();
      }
      
      // Ctrl/Cmd + Shift + R to reset timer
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        this.resetTimer();
      }
      
      // Escape to close overlay
      if (event.key === 'Escape' && this.overlayVisible) {
        this.hideOverlay();
      }
    });
  }
  
  checkInitialTimerState() {
    chrome.runtime.sendMessage({ action: 'getTimerState' }, (response) => {
      if (response && response.isRunning) {
        this.handleTimerStarted(response.timeLeft, response.isBreak);
        this.updateTimerDisplay(response.timeLeft, response.isBreak);
      }
    });
  }
  
  handleTimerStarted(duration, isBreak) {
    this.isTimerRunning = true;
    this.showIndicator();
    this.indicator.classList.add('running');
    if (isBreak) {
      this.indicator.classList.add('break');
    } else {
      this.indicator.classList.remove('break');
    }
    
    this.updateStatus(isBreak ? 'Break' : 'Focus');
    
    // Show focus mode overlay for focus sessions
    if (!isBreak) {
      this.showFocusModePrompt();
    }
  }
  
  handleTimerPaused() {
    this.isTimerRunning = false;
    this.indicator.classList.remove('running');
    this.updateStatus('Paused');
  }
  
  handleTimerReset() {
    this.isTimerRunning = false;
    this.indicator.classList.remove('running', 'break');
    this.updateStatus('Ready');
    this.hideOverlay();
  }
  
  handleSessionComplete(isBreak) {
    this.isTimerRunning = false;
    this.indicator.classList.remove('running');
    
    // Show completion notification
    this.showSessionCompleteOverlay(isBreak);
    
    this.updateStatus('Complete');
  }
  
  updateTimerDisplay(timeLeft, isBreak) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timeElement = this.indicator.querySelector('.pomodoro-time');
    if (timeElement) {
      timeElement.textContent = timeString;
    }
  }
  
  updateStatus(status) {
    const statusElement = this.indicator.querySelector('.pomodoro-status');
    if (statusElement) {
      statusElement.textContent = status;
    }
  }
  
  showIndicator() {
    this.indicator.style.display = 'block';
  }
  
  hideIndicator() {
    this.indicator.style.display = 'none';
  }
  
  showFocusModePrompt() {
    const overlay = document.createElement('div');
    overlay.className = 'pomodoro-overlay';
    overlay.innerHTML = `
      <div class="pomodoro-overlay-content">
        <h2>🍅 Focus Mode</h2>
        <p>Ready to start your focus session?<br>You can minimize distractions and stay productive.</p>
        <button onclick="this.parentElement.parentElement.remove()">Start Focusing</button>
        <button class="secondary" onclick="this.parentElement.parentElement.remove()">Continue Normally</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.overlayVisible = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (overlay.parentElement) {
        overlay.remove();
        this.overlayVisible = false;
      }
    }, 5000);
  }
  
  showSessionCompleteOverlay(wasBreak) {
    const overlay = document.createElement('div');
    overlay.className = 'pomodoro-overlay';
    
    const title = wasBreak ? '🎉 Break Complete!' : '🍅 Session Complete!';
    const message = wasBreak ? 
      'Time to get back to productive work!' : 
      'Great job! Time for a well-deserved break.';
    
    overlay.innerHTML = `
      <div class="pomodoro-overlay-content">
        <h2>${title}</h2>
        <p>${message}</p>
        <button onclick="this.parentElement.parentElement.remove(); window.pomodoroContent.startNextSession()">Continue</button>
        <button class="secondary" onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.overlayVisible = true;
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (overlay.parentElement) {
        overlay.remove();
        this.overlayVisible = false;
      }
    }, 10000);
  }
  
  hideOverlay() {
    const overlays = document.querySelectorAll('.pomodoro-overlay');
    overlays.forEach(overlay => overlay.remove());
    this.overlayVisible = false;
  }
  
  toggleTimer() {
    chrome.runtime.sendMessage({ action: 'toggleTimer' });
  }
  
  resetTimer() {
    chrome.runtime.sendMessage({ action: 'timerReset' });
  }
  
  toggleTimerPopup() {
    // This will open the extension popup
    chrome.runtime.sendMessage({ action: 'openPopup' });
  }
  
  startNextSession() {
    chrome.runtime.sendMessage({ action: 'startNextSession' });
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroContent = new PomodoroContentScript();
  });
} else {
  window.pomodoroContent = new PomodoroContentScript();
}

// Handle page navigation in SPAs
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Reinitialize on URL change for SPAs
    if (window.pomodoroContent) {
      window.pomodoroContent.checkInitialTimerState();
    }
  }
}).observe(document, { subtree: true, childList: true });