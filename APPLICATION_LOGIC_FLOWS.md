# Pomodoro Timer - Application Logic Flows

## Overview
This document outlines the complete logic flows and architecture of the Pomodoro Timer application, detailing how data flows through components and how user interactions are handled.

## Core Architecture

### 1. State Management Flow
```
App Component (Root)
├── useSettings Hook (Persistent Settings)
├── useTimer Hook (Timer Logic)
├── Session Management (sessionIndex)
└── UI State (showStats, showPresetModal)
```

### 2. Timer State Management
**Flow:** `sessionDuration` → `remaining` → `progress` → UI Updates

**Key Components:**
- **useTimer Hook**: Core timer logic using Web Workers
- **Timer State**: `remaining`, `isRunning`, `progress`
- **Session Info**: Calculated from `sessionIndex` and `preset`

**Timer Lifecycle:**
1. Session starts → Web Worker created
2. Every second → Worker posts 'tick' message
3. Timer decreases → Progress calculated
4. Timer reaches 0 → Session complete → Auto-start logic

### 3. Session Management Flow
**Session Calculation Logic:**
```javascript
const isWork = sessionIndex % 2 === 0
const isLongBreak = !isWork && ((sessionIndex + 1) % (preset.cycle * 2) === 0)
const sessionDuration = isWork ? preset.work : isLongBreak ? preset.longBreak : preset.shortBreak
```

**Session Transition Flow:**
1. Current session completes
2. `onSessionComplete` callback triggered
3. Session data saved to history
4. If `autoStartNext` enabled → Delay → Next session starts
5. `sessionIndex` incremented → New session type calculated

### 4. Settings & Persistence Flow
**Storage Strategy:**
- Main settings: `localStorage['timer-Settings']`
- Custom presets: `localStorage['pomodoro-custom-presets']`
- Auto-save on every state change

**Settings Update Flow:**
1. User interaction → `updateSettings()` called
2. State updated via `setSettings()`
3. `useEffect` triggers → Data saved to localStorage
4. Dependent components re-render

### 5. User Interaction Flows

#### Timer Editing Flow
```
Timer Click → Edit Mode → Validation → Time Update
├── Click timer display (when paused)
├── Input field appears with current time
├── Real-time validation on input change
├── Enter/Blur → Validate → Update timer
└── Escape → Cancel editing
```

#### Preset Selection Flow
```
Preset Button Click → Settings Update → Timer Reset
├── User clicks preset button
├── `updatePreset()` called with new preset
├── Settings state updated
├── Timer recalculates session duration
└── UI updates with new values
```

#### Quick Time Adjustment Flow
```
+/- Button Click → Time Calculation → Timer Update
├── User clicks +1min, +5min, -1min, -5min
├── New time = current remaining ± adjustment
├── Bounds checking (minimum 0)
├── Timer state updated
└── Progress recalculated
```

### 6. Statistics Flow
**Data Collection:**
- Session completion → `addSessionToHistory()`
- Statistics calculated in real-time
- History limited to last 100 sessions

**Statistics Calculation:**
```javascript
completedSessions: counter
totalWorkTime: sum of work session durations  
totalBreakTime: sum of break session durations
sessionHistory: array of session objects
```

### 7. Performance Optimizations

#### Component Optimization
- **React.memo**: Timer, TimerControls, PresetButtons
- **useMemo**: Expensive calculations (session info, cycle totals)
- **useCallback**: Stable function references

#### CSS Performance
- **GPU Acceleration**: `transform: translateZ(0)`
- **Will-change**: Applied to animated elements
- **Contain**: Layout containment for progress bars

#### Web Worker Usage
- Timer logic runs in separate thread
- Prevents main thread blocking
- Accurate timing independent of UI updates

### 8. Responsive Design Strategy

#### Breakpoint Strategy
```css
Mobile: < 640px (touch-optimized)
Tablet: 641px - 1024px (hybrid)
Desktop: > 1024px (full features)
```

#### Mobile Optimizations
- Touch targets minimum 44px
- Text hiding on small screens
- Simplified layouts
- Larger tap areas
- Optimized font sizes

#### Layout Adaptations
- Single column on mobile
- Two-column with stats on desktop
- Flexible grid system
- Context-aware spacing

### 9. Accessibility Features
- **ARIA Labels**: All interactive elements
- **Keyboard Navigation**: Full app usable with keyboard
- **Screen Reader Support**: Semantic HTML structure
- **Focus Management**: Proper tab order
- **High Contrast**: Neo-brutalist design aids visibility

### 10. Error Handling & Edge Cases

#### Timer Edge Cases
- Web Worker cleanup on component unmount
- Timer accuracy with page visibility changes
- Negative time prevention
- Invalid time input validation

#### Data Validation
- Time input format validation (MM:SS, HH:MM:SS)
- Bounds checking for all numeric inputs
- localStorage error handling
- Preset validation

### 11. Future Extensibility Points

#### Modular Architecture
- Hook-based logic separation
- Component composition patterns
- Configurable constants
- Plugin-ready structure

#### Extension Areas
- Custom notification sounds
- Theme system
- Export/import functionality
- Advanced statistics
- Multi-preset workflows

## Performance Metrics
- **First Contentful Paint**: Optimized with font loading
- **Largest Contentful Paint**: Minimal layout shifts
- **Cumulative Layout Shift**: Stable layouts
- **Time to Interactive**: Minimal JavaScript bundle

## Browser Compatibility
- Modern browsers (ES2018+)
- Web Workers support required
- CSS Grid and Flexbox
- localStorage API
- AudioContext for notifications