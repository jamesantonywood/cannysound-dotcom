// src/stores/audioStore.js
import { defineStore } from 'pinia'

export const useAudioStore = defineStore('audio', {
  // State
  state: () => ({
    audioContext: null,
    analyser: null,
    mixer: null,
    audioBuffers: {},
    activeSources: [],
    isVisualizationRunning: false,
    hasPlayedFirstTrack: false,
    trackList: [],
    isLoading: true,
    error: null,
    loopingTracks: {}, // Track which URLs are currently looping
  }),

  // Getters
  getters: {
    hasAudioContext: (state) => !!state.audioContext,
    isPlaying: (state) => state.activeSources.length > 0,
    firstTrack: (state) => state.trackList[0] || null,
  },

  // Actions
  actions: {
    initAudioContext() {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        this.analyser = this.audioContext.createAnalyser()
        this.mixer = this.audioContext.createGain()
        this.mixer.connect(this.analyser)
        this.analyser.connect(this.audioContext.destination)
      }
      return this.audioContext
    },

    async fetchTrackList() {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('./src/sounds.json')
        if (!response.ok) {
          throw new Error('Failed to load track list')
        }
        const data = await response.json()
        this.trackList = data.tracks || []
        await this.preloadTracks()
        this.isLoading = false
      } catch (err) {
        console.error('Error fetching track list:', err)
        this.error = err.message
        this.isLoading = false
      }
    },

    async preloadTracks() {
      if (!this.audioContext) this.initAudioContext()

      for (const track of this.trackList) {
        try {
          const response = await fetch(track.url)
          const arrayBuffer = await response.arrayBuffer()
          const buffer = await this.audioContext.decodeAudioData(arrayBuffer)
          this.audioBuffers[track.url] = buffer
        } catch (err) {
          console.error('Failed to load ' + track.url, err)
          this.error = err.message || 'Failed to load audio'
        }
      }
    },

    playTrack(url) {
      if (!this.audioContext) this.initAudioContext()

      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }

      const buffer = this.audioBuffers[url]
      if (!buffer) return

      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.mixer)
      source.start()

      // Add to active sources
      this.activeSources.push(source)

      // Clean up when track ends
      source.onended = () => {
        const index = this.activeSources.indexOf(source)
        if (index !== -1) this.activeSources.splice(index, 1)
      }

      // Mark that we've played a track
      this.hasPlayedFirstTrack = true
    },

    playTrackLoop(url) {
      if (!this.audioContext) this.initAudioContext()

      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }

      const buffer = this.audioBuffers[url]
      if (!buffer) return

      // Check if this track is already looping
      if (this.loopingTracks[url]) {
        console.log(`Track ${url} is already looping`)
        return
      }

      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.mixer)

      // Enable looping on the buffer source
      source.loop = true

      // Start the source
      source.start()

      // Add to active sources
      this.activeSources.push(source)

      // Mark this URL as looping
      this.loopingTracks[url] = source

      // Mark that we've played a track
      this.hasPlayedFirstTrack = true

      return source
    },

    stopLoopingTrack(url) {
      const loopingSource = this.loopingTracks[url]

      if (loopingSource) {
        // Stop the audio
        loopingSource.stop()

        // Remove from active sources
        const index = this.activeSources.indexOf(loopingSource)
        if (index !== -1) this.activeSources.splice(index, 1)

        // Remove from looping tracks
        delete this.loopingTracks[url]

        return true
      }

      return false
    },

    playFirstTrack() {
      console.log('first track')
      if (this.hasPlayedFirstTrack) return

      if (this.firstTrack) {
        this.playTrack(this.firstTrack.url)
        this.hasPlayedFirstTrack = true
      }
    },

    getAnalyser() {
      return this.analyser
    },

    cleanup() {
      // Stop all active audio sources
      this.activeSources.forEach((source) => {
        if (source && typeof source.stop === 'function') {
          source.stop()
        }
      })

      // Clear the active sources
      this.activeSources = []

      // Clear looping tracks
      this.loopingTracks = {}

      // Close audio context if supported
      if (this.audioContext && typeof this.audioContext.close === 'function') {
        this.audioContext.close()
        this.audioContext = null
        this.analyser = null
        this.mixer = null
      }
    },

    // Helper function to check if a track is currently looping
    isTrackLooping(url) {
      return !!this.loopingTracks[url]
    },

    // Function to stop all sounds immediately
    stopAllSounds() {
      // Stop all active sources
      this.activeSources.forEach((source) => {
        try {
          source.stop()
        } catch (e) {
          console.error('Error stopping source:', e)
        }
      })

      // Clear arrays
      this.activeSources = []
      this.loopingTracks = {}
    },
  },
})
