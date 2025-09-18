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
  volume: 0.5,
  completedSessions: 0,
  totalWorkTime: 0,
  totalBreakTime: 0,
  sessionHistory: []
}

export const PRESETS = [
  { name: '25/5/15', work: 1500, shortBreak: 300, longBreak: 900, cycle: 4 },
  { name: '50/10/20', work: 3000, shortBreak: 600, longBreak: 1200, cycle: 3 },
  { name: '90/20/30', work: 5400, shortBreak: 1200, longBreak: 1800, cycle: 2 },
  { name: '15/3/10', work: 900, shortBreak: 180, longBreak: 600, cycle: 6 },
  { name: '45/10/20', work: 2700, shortBreak: 600, longBreak: 1200, cycle: 4 },
  { name: '20/5/15', work: 1200, shortBreak: 300, longBreak: 900, cycle: 5 },
  { name: '30/5/15', work: 1800, shortBreak: 300, longBreak: 900, cycle: 4 },
  { name: '60/15/30', work: 3600, shortBreak: 900, longBreak: 1800, cycle: 3 },
]

export const STORAGE_KEY = 'pomodoro-settings'
