import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkTheme: false,
  }),

  actions: {
    // Initialize theme from localStorage and system preference
    initTheme() {
      // Check localStorage first
      const savedTheme = localStorage.getItem('isDarkTheme')

      if (savedTheme !== null) {
        // Use saved preference if available
        this.isDarkTheme = JSON.parse(savedTheme)
      } else {
        // Otherwise use system preference
        this.isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      }

      // Apply theme immediately
      this.applyTheme()

      // Set up system theme change listener
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only apply system changes if no user preference is saved
        if (localStorage.getItem('isDarkTheme') === null) {
          this.isDarkTheme = e.matches
          this.applyTheme()
        }
      })
      console.log('Applying theme:', this.isDarkTheme ? 'dark' : 'light')
    },

    // Toggle between light and dark themes
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
      localStorage.setItem('isDarkTheme', JSON.stringify(this.isDarkTheme))
      this.applyTheme()
    },

    // Set specific theme ('dark' or 'light')
    setTheme(theme) {
      this.isDarkTheme = theme === 'dark'
      localStorage.setItem('isDarkTheme', JSON.stringify(this.isDarkTheme))
      this.applyTheme()
    },

    // Use system preference and remove saved preference
    useSystemTheme() {
      localStorage.removeItem('isDarkTheme')
      this.isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.applyTheme()
    },

    // Apply current theme to the body element
    applyTheme() {
      if (this.isDarkTheme) {
        document.body.classList.add('dark-theme')
        document.body.classList.remove('light-theme')
      } else {
        document.body.classList.add('light-theme')
        document.body.classList.remove('dark-theme')
      }
    },
  },

  getters: {
    // Return current theme as string
    currentTheme: (state) => (state.isDarkTheme ? 'dark' : 'light'),
  },
})
