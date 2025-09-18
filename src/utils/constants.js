export const DEFAULT_PRESET = {
  name: '25min',
  work: 25 * 60,
  shortBreak: 5 * 60, // Keep for backward compatibility
  longBreak: 15 * 60, // Keep for backward compatibility
  cycle: 4,
}

export const DEFAULT_SETTINGS = {
  preset: DEFAULT_PRESET,
  autoStartNext: true,
  delayNext: 0,
  completedSessions: 0,
  totalWorkTime: 0,
  totalBreakTime: 0, // Now represents pause time
  pauseCount: 0, // New stat for tracking pauses
  sessionHistory: []
}

export const PRESETS = [
  { name: '25min', work: 1500, shortBreak: 300, longBreak: 900, cycle: 4 },
  { name: '50min', work: 3000, shortBreak: 600, longBreak: 1200, cycle: 3 },
  { name: '30min', work: 1800, shortBreak: 300, longBreak: 900, cycle: 4 },
  { name: '60min', work: 3600, shortBreak: 600, longBreak: 1200, cycle: 2 },
]

export const STORAGE_KEY = 'timer-Settings'
