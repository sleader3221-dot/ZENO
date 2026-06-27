/* ===================================================
   NEXUS — Data Store (localStorage persistence)
   =================================================== */

const NexusDB = (() => {
  const KEY = 'nexus_data';
  const defaults = {
    user: null,
    onboarded: false,
    moods: [],
    goals: [],
    expenses: [],
    savings: [],
    journal: [],
    achievements: [],
    conversations: {},
    xp: 0,
    level: 1,
    streak: 0,
    lastCheckIn: null,
    lastMoodDate: null,
    careerProfile: {},
    resumeData: {},
    settings: { accessibility: false, highContrast: false, voice: true }
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch { return { ...defaults }; }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }

  let state = load();

  return {
    get: (key) => key ? state[key] : state,
    set: (key, value) => {
      state[key] = value;
      save(state);
    },
    update: (key, fn) => {
      state[key] = fn(state[key]);
      save(state);
    },
    reset: () => {
      state = { ...defaults };
      localStorage.removeItem(KEY);
    },

    // User
    getUser: () => state.user,
    setUser: (user) => { state.user = user; save(state); },

    // Moods
    getMoods: () => state.moods || [],
    addMood: (entry) => {
      state.moods = [entry, ...(state.moods || [])].slice(0, 90);
      state.lastMoodDate = new Date().toDateString();
      save(state);
    },
    hasMoodToday: () => state.lastMoodDate === new Date().toDateString(),

    // Goals
    getGoals: () => state.goals || [],
    addGoal: (goal) => {
      const g = { id: Date.now(), ...goal, created: new Date().toISOString(), completed: false };
      state.goals = [g, ...(state.goals || [])];
      save(state);
      return g;
    },
    toggleGoal: (id) => {
      state.goals = (state.goals || []).map(g =>
        g.id === id ? { ...g, completed: !g.completed, completedAt: !g.completed ? new Date().toISOString() : null } : g
      );
      save(state);
    },
    deleteGoal: (id) => {
      state.goals = (state.goals || []).filter(g => g.id !== id);
      save(state);
    },

    // Expenses
    getExpenses: () => state.expenses || [],
    addExpense: (exp) => {
      const e = { id: Date.now(), ...exp, date: new Date().toISOString() };
      state.expenses = [e, ...(state.expenses || [])].slice(0, 200);
      save(state);
      return e;
    },
    deleteExpense: (id) => {
      state.expenses = (state.expenses || []).filter(e => e.id !== id);
      save(state);
    },

    // Savings Goals
    getSavings: () => state.savings || [],
    addSavings: (goal) => {
      const g = { id: Date.now(), ...goal, saved: 0, created: new Date().toISOString() };
      state.savings = [g, ...(state.savings || [])];
      save(state);
      return g;
    },
    updateSavings: (id, amount) => {
      state.savings = (state.savings || []).map(g =>
        g.id === id ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g
      );
      save(state);
    },

    // Journal
    getJournalEntries: () => state.journal || [],
    addJournalEntry: (entry) => {
      const e = { id: Date.now(), ...entry, date: new Date().toISOString() };
      state.journal = [e, ...(state.journal || [])].slice(0, 100);
      save(state);
      return e;
    },

    // XP & Level
    getXP: () => state.xp || 0,
    getLevel: () => state.level || 1,
    addXP: (amount) => {
      state.xp = (state.xp || 0) + amount;
      state.level = Math.floor(Math.sqrt(state.xp / 100)) + 1;
      save(state);
      return { xp: state.xp, level: state.level };
    },
    getXPToNext: () => {
      const lvl = state.level || 1;
      const needed = (lvl * lvl) * 100;
      const prev = ((lvl - 1) * (lvl - 1)) * 100;
      const current = (state.xp || 0) - prev;
      return { current, needed: needed - prev, percent: Math.round((current / (needed - prev)) * 100) };
    },

    // Streak
    getStreak: () => state.streak || 0,
    updateStreak: () => {
      const today = new Date().toDateString();
      const lastCheck = state.lastCheckIn;
      if (lastCheck === today) return state.streak;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      state.streak = lastCheck === yesterday ? (state.streak || 0) + 1 : 1;
      state.lastCheckIn = today;
      save(state);
      return state.streak;
    },

    // Achievements
    getAchievements: () => state.achievements || [],
    unlockAchievement: (id) => {
      if (!(state.achievements || []).includes(id)) {
        state.achievements = [...(state.achievements || []), id];
        save(state);
        return true;
      }
      return false;
    },
    hasAchievement: (id) => (state.achievements || []).includes(id),

    // Conversations
    getConversation: (module) => state.conversations?.[module] || [],
    saveConversation: (module, msgs) => {
      state.conversations = { ...(state.conversations || {}), [module]: msgs.slice(-50) };
      save(state);
    },

    // Career
    getCareerProfile: () => state.careerProfile || {},
    setCareerProfile: (profile) => { state.careerProfile = { ...(state.careerProfile || {}), ...profile }; save(state); },

    // Resume
    getResumeData: () => state.resumeData || {},
    setResumeData: (data) => { state.resumeData = { ...(state.resumeData || {}), ...data }; save(state); },

    // Settings
    getSettings: () => state.settings || defaults.settings,
    setSetting: (key, val) => {
      state.settings = { ...(state.settings || defaults.settings), [key]: val };
      save(state);
    }
  };
})();

window.NexusDB = NexusDB;
