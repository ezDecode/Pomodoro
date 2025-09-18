export const DEFAULT_PRESET = {
  name: '25/5/15',
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  cycle: 4,
}

export const DEFAULT_SETTINGS = {
  preset: DEFAULT_PRESET,
  autoStartNext: true,
  delayNext: 0,
  completedSessions: 0,
  totalWorkTime: 0,
  totalBreakTime: 0,
  sessionHistory: []
}

export const PRESETS = [
  { name: '25/5/15', work: 1500, shortBreak: 300, longBreak: 900, cycle: 4 },
  { name: '50/10/20', work: 3000, shortBreak: 600, longBreak: 1200, cycle: 3 },
]

export const STORAGE_KEY = 'timer-Settings'
