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
    volume: 1.0, // Default volume level (1.0 = 100%)
    transitionTime: 1.0, // Default transition time in seconds

    videoElements: {}, // Store references to video elements
    videoBuffers: {}, // Store audio data from videos
    strapiBaseUrl: 'http://localhost:1337', // Adjust to your Strapi URL
  }),

  // Getters
  getters: {
    hasAudioContext: (state) => !!state.audioContext,
    isPlaying: (state) => state.activeSources.length > 0,
    firstTrack: (state) => state.trackList[0] || null,
    currentVolume: (state) => state.volume,
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

        // Set initial volume with taper
        this.setVolume(this.volume, 0) // No transition for initial setup
      }
      return this.audioContext
    },

    // Set the volume level (0.0 to 1.0) with logarithmic taper and smooth transition
    setVolume(value, transitionTime = null) {
      // Use specified transition time or default
      const transition = transitionTime !== null ? transitionTime : this.transitionTime

      // Ensure volume is between 0 and 1
      const linearVolume = Math.max(0, Math.min(1, value))
      this.volume = linearVolume

      // Apply logarithmic taper to the volume
      // This formula creates a logarithmic curve that sounds more natural
      // to human ears than a linear volume control
      let taperedVolume = 0

      if (linearVolume > 0) {
        // Using an exponential curve with base 2
        // This provides a natural-sounding volume curve
        taperedVolume = Math.pow(linearVolume, 3)
      }

      // Update the mixer gain if it exists
      if (this.mixer && this.audioContext) {
        const now = this.audioContext.currentTime

        // Get the gain parameter
        const gainParam = this.mixer.gain

        // Schedule the volume change with a smooth ramp
        gainParam.cancelScheduledValues(now)

        // If transition time is 0, change immediately
        if (transition <= 0) {
          gainParam.setValueAtTime(taperedVolume, now)
        } else {
          // Otherwise, smooth transition over specified time
          // First set current value to avoid clicks
          gainParam.setValueAtTime(gainParam.value, now)
          // Then schedule the ramp to the new value
          gainParam.exponentialRampToValueAtTime(
            Math.max(0.0001, taperedVolume), // Ensure we don't go to exactly 0 for exponential ramp
            now + transition,
          )

          // If we need to go all the way to 0, add a linear ramp for the final bit
          if (taperedVolume === 0) {
            gainParam.linearRampToValueAtTime(0, now + transition + 0.01)
          }
        }
      }

      return linearVolume
    },

    // Set the transition time for volume changes (in seconds)
    setTransitionTime(seconds) {
      this.transitionTime = Math.max(0, seconds)
      return this.transitionTime
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

    // Fetch videos from Strapi
    async fetchVideosFromStrapi() {
      this.isLoading = true
      this.error = null

      try {
        // Adjust the endpoint based on your Strapi API structure
        const response = await fetch(`${this.strapiBaseUrl}/api/projects?populate=*`)

        if (!response.ok) {
          throw new Error('Failed to load videos from Strapi')
        }

        const data = await response.json()
        const videos = data.data || []

        // Process videos - this will depend on your Strapi structure
        const processedVideos = videos.map((video) => {
          console.log(video)
          return {
            id: video.id,
            // title: video.attributes.title,
            url: `${this.strapiBaseUrl}${video.video.url}`,
            // Add other attributes as needed
          }
        })

        // Add videos to trackList
        this.trackList = [...this.trackList, ...processedVideos]

        // Preload the videos
        await this.preloadVideos(processedVideos)

        this.isLoading = false
        return processedVideos
      } catch (err) {
        console.error('Error fetching videos from Strapi:', err)
        this.error = err.message
        this.isLoading = false
        return []
      }
    },

    // Preload videos and extract their audio
    async preloadVideos(videos) {
      if (!this.audioContext) this.initAudioContext()

      const loadPromises = videos.map((video) => this.loadVideoAudio(video.url))
      return Promise.all(loadPromises)
    },

    // Load a single video and extract its audio
    async loadVideoAudio(url) {
      return new Promise((resolve, reject) => {
        // Create a video element
        const video = document.createElement('video')
        video.crossOrigin = 'anonymous' // Important for audio extraction

        // Create media element source
        const videoSource = this.audioContext.createMediaElementSource(video)

        // Store references
        this.videoElements[url] = {
          element: video,
          source: videoSource,
        }

        // Set up video
        video.src = url
        video.load()

        // Listen for when it's loaded enough to play
        video.addEventListener('canplaythrough', () => {
          console.log(`Video loaded: ${url}`)
          resolve(url)
        })

        // Handle errors
        video.addEventListener('error', (err) => {
          console.error(`Error loading video ${url}`, err)
          reject(err)
        })

        // Add to DOM but hide it (needed for some browsers)
        video.style.display = 'none'
        document.body.appendChild(video)
      })
    },

    // Play video audio through the audio context
    playVideoAudio(url) {
      if (!this.videoElements[url]) {
        console.error(`Video not loaded: ${url}`)
        return
      }

      if (!this.audioContext) this.initAudioContext()

      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }

      const videoData = this.videoElements[url]
      const video = videoData.element
      const source = videoData.source

      // Connect source to mixer if not already connected
      if (!videoData.connected) {
        source.connect(this.mixer)
        videoData.connected = true
      }

      // Play the video (which plays the audio)
      video.play().catch((err) => {
        console.error(`Error playing video ${url}`, err)
      })

      // Add to active sources list (for tracking)
      this.activeSources.push({
        type: 'video',
        url,
        stop: () => {
          video.pause()
          video.currentTime = 0
        },
      })

      // Mark that we've played a track
      this.hasPlayedFirstTrack = true

      return videoData
    },

    // Stop playing a video
    stopVideoAudio(url) {
      if (!this.videoElements[url]) return false

      const video = this.videoElements[url].element
      video.pause()
      video.currentTime = 0

      // Remove from active sources
      const index = this.activeSources.findIndex(
        (source) => source.type === 'video' && source.url === url,
      )

      if (index !== -1) {
        this.activeSources.splice(index, 1)
      }

      return true
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
      // Original cleanup code...

      // Clean up video elements
      Object.values(this.videoElements).forEach((videoData) => {
        const video = videoData.element

        // Pause and remove event listeners
        video.pause()
        video.src = ''

        // Remove from DOM if it was added
        if (video.parentNode) {
          video.parentNode.removeChild(video)
        }

        // Disconnect source if connected
        if (videoData.source) {
          videoData.source.disconnect()
        }
      })

      this.videoElements = {}
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
