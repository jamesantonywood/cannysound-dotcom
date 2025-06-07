// src/stores/audioStore.js
import { defineStore } from 'pinia'

export const useAudioStore = defineStore('audio', {
  // State
  state: () => ({
    isMuted: false,
    audioContext: null,
    analyser: null,
    mixer: null,
    audioBuffers: {},
    activeSources: new Map(), // Changed to Map for better tracking
    isVisualizationRunning: false,
    hasPlayedFirstTrack: false,
    trackList: [],
    isLoading: true,
    error: null,
    loopingTracks: {}, // Track which URLs are currently looping
    volume: 1.0, // Default volume level (1.0 = 100%)
    transitionTime: 1.0, // Default transition time in seconds

    videoElements: {}, // Store references to video elements
  }),

  // Getters
  getters: {
    hasAudioContext: (state) => !!state.audioContext,
    isPlaying: (state) => state.activeSources.size > 0,
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

    getAnalyser() {
      return this.analyser || null
    },

    // Helper function to determine if a URL is a video file
    isVideoFile(url) {
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']
      return videoExtensions.some((ext) => url.toLowerCase().includes(ext))
    },

    // Helper function to normalize URLs for consistent lookup
    normalizeUrl(url) {
      // Convert full URLs to relative paths for consistent storage
      try {
        const urlObj = new URL(url)
        return urlObj.pathname
      } catch {
        // If it's already a relative path, return as-is
        return url
      }
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

    // Fetch video projects and add them to trackList like regular tracks
    async fetchVideos() {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('./src/projects.json')

        if (!response.ok) {
          throw new Error('Failed to load projects from JSON')
        }

        const data = await response.json()
        const videos = data.projects || []

        // Process videos to match the same structure as audio tracks
        const processedVideos = videos.map((video) => {
          return {
            name: video.name,
            url: video.video,
            type: 'video', // Add type to distinguish from audio
          }
        })

        // Add videos to trackList (like audio tracks)
        this.trackList = [...this.trackList, ...processedVideos]

        // Preload the videos like we do with audio tracks
        await this.preloadTracks()

        this.isLoading = false
        return processedVideos
      } catch (err) {
        console.error('Error fetching videos from JSON:', err)
        this.error = err.message
        this.isLoading = false
        return []
      }
    },

    async preloadTracks() {
      if (!this.audioContext) this.initAudioContext()

      for (const track of this.trackList) {
        try {
          if (this.isVideoFile(track.url)) {
            // Handle video files
            await this.loadVideoAudio(track.url)
          } else {
            // Handle audio files
            const response = await fetch(track.url)
            const arrayBuffer = await response.arrayBuffer()
            const buffer = await this.audioContext.decodeAudioData(arrayBuffer)
            this.audioBuffers[track.url] = buffer
          }
        } catch (err) {
          console.error('Failed to load ' + track.url, err)
          this.error = err.message || 'Failed to load audio/video'
        }
      }
    },

    // Load a single video and set up its audio source
    async loadVideoAudio(url) {
      return new Promise((resolve, reject) => {
        // Normalize the URL for consistent storage
        const normalizedUrl = this.normalizeUrl(url)

        // Create a video element
        const video = document.createElement('video')
        video.crossOrigin = 'anonymous'
        video.preload = 'metadata'

        // Set up video with the original URL
        video.src = url

        // Create media element source
        const videoSource = this.audioContext.createMediaElementSource(video)

        // Store references using normalized URL
        this.videoElements[normalizedUrl] = {
          element: video,
          source: videoSource,
          connected: false,
          originalUrl: url, // Store original URL for reference
        }

        // Listen for when it's loaded enough
        video.addEventListener('loadedmetadata', () => {
          console.log(`Video metadata loaded: ${normalizedUrl}`)
          resolve(normalizedUrl)
        })

        // Handle errors
        video.addEventListener('error', (err) => {
          console.error(`Error loading video ${normalizedUrl}`, err)
          reject(err)
        })

        // Add to DOM but hide it (needed for some browsers)
        video.style.display = 'none'
        video.style.position = 'absolute'
        video.style.top = '-9999px'
        document.body.appendChild(video)

        // Start loading
        video.load()
      })
    },

    playTrack(url) {
      if (!this.audioContext) this.initAudioContext()

      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }

      // Check if it's a video file
      if (this.isVideoFile(url)) {
        return this.playVideoAudio(url)
      }

      // Handle regular audio files
      const buffer = this.audioBuffers[url]
      if (!buffer) return

      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.mixer)
      source.start()

      // Add to active sources with proper tracking
      this.activeSources.set(url, {
        source,
        type: 'audio',
        url,
        isLooping: false,
      })

      // Clean up when track ends
      source.onended = () => {
        this.activeSources.delete(url)
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

      // Check if this track is already looping
      if (this.loopingTracks[url]) {
        console.log(`Track ${url} is already looping`)
        return
      }

      // Check if it's a video file
      if (this.isVideoFile(url)) {
        return this.playVideoAudioLoop(url)
      }

      // Handle regular audio files
      const buffer = this.audioBuffers[url]
      if (!buffer) return

      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.mixer)

      // Enable looping on the buffer source
      source.loop = true

      // Start the source
      source.start()

      // Add to active sources and looping tracks
      this.activeSources.set(url, {
        source,
        type: 'audio',
        url,
        isLooping: true,
      })

      this.loopingTracks[url] = source

      // Mark that we've played a track
      this.hasPlayedFirstTrack = true

      return source
    },

    // Play video audio through the audio context
    playVideoAudio(url) {
      // Normalize URL for lookup
      const normalizedUrl = this.normalizeUrl(url)

      if (!this.videoElements[normalizedUrl]) {
        console.error(`Video not loaded: ${normalizedUrl}`)
        console.log('Available videos:', Object.keys(this.videoElements))
        return
      }

      const videoData = this.videoElements[normalizedUrl]
      const video = videoData.element
      const source = videoData.source

      // Connect source to mixer if not already connected
      if (!videoData.connected) {
        source.connect(this.mixer)
        videoData.connected = true
      }

      // Play the video (which plays the audio)
      video.play().catch((err) => {
        console.error('Error playing video:', normalizedUrl, err)
      })

      // Add to active sources using normalized URL
      this.activeSources.set(normalizedUrl, {
        source: video,
        type: 'video',
        url: normalizedUrl,
        isLooping: false,
      })

      // Clean up when video ends
      video.onended = () => {
        this.activeSources.delete(normalizedUrl)
      }

      // Mark that we've played a track
      this.hasPlayedFirstTrack = true

      return videoData
    },

    // Play video audio in loop
    playVideoAudioLoop(url) {
      // Normalize URL for lookup
      const normalizedUrl = this.normalizeUrl(url)

      if (!this.videoElements[normalizedUrl]) {
        console.error(`Video not loaded: ${normalizedUrl}`)
        return
      }

      // Check if this video is already looping
      if (this.loopingTracks[normalizedUrl]) {
        console.log(`Video ${normalizedUrl} is already looping`)
        return
      }

      const videoData = this.videoElements[normalizedUrl]
      const video = videoData.element
      const source = videoData.source

      // Connect source to mixer if not already connected
      if (!videoData.connected) {
        source.connect(this.mixer)
        videoData.connected = true
      }

      // Set up looping
      video.loop = true

      // Play the video
      video.play().catch((err) => {
        console.error('Error playing video:', normalizedUrl, err)
      })

      // Add to active sources and looping tracks using normalized URL
      this.activeSources.set(normalizedUrl, {
        source: video,
        type: 'video',
        url: normalizedUrl,
        isLooping: true,
      })

      this.loopingTracks[normalizedUrl] = video

      // Mark that we've played a track
      this.hasPlayedFirstTrack = true

      return videoData
    },

    pauseTrack(url) {
      // Normalize URL for consistent lookup
      const normalizedUrl = this.normalizeUrl(url)
      const activeSource = this.activeSources.get(normalizedUrl)

      if (!activeSource) return false

      try {
        if (activeSource.type === 'video') {
          // Handle video pause
          activeSource.source.pause()
        } else {
          // Handle audio pause (stop for buffer sources)
          activeSource.source.stop()
        }

        // Remove from active sources
        this.activeSources.delete(normalizedUrl)

        // Remove from looping tracks if it was looping
        if (this.loopingTracks[normalizedUrl]) {
          delete this.loopingTracks[normalizedUrl]
        }

        return true
      } catch (err) {
        console.error('Error pausing track:', normalizedUrl, err)
        return false
      }
    },

    stopTrack(url) {
      // Normalize URL for consistent lookup
      const normalizedUrl = this.normalizeUrl(url)
      const activeSource = this.activeSources.get(normalizedUrl)

      if (!activeSource) return false

      try {
        if (activeSource.type === 'video') {
          // Handle video stop
          activeSource.source.pause()
          activeSource.source.currentTime = 0
          activeSource.source.loop = false
        } else {
          // Handle audio stop
          activeSource.source.stop()
        }

        // Remove from active sources
        this.activeSources.delete(normalizedUrl)

        // Remove from looping tracks if it was looping
        if (this.loopingTracks[normalizedUrl]) {
          delete this.loopingTracks[normalizedUrl]
        }

        return true
      } catch (err) {
        console.error('Error stopping track:', normalizedUrl, err)
        return false
      }
    },

    stopLoopingTrack(url) {
      // Normalize URL for consistent lookup
      const normalizedUrl = this.normalizeUrl(url)
      const loopingSource = this.loopingTracks[normalizedUrl]

      if (!loopingSource) return false

      try {
        if (this.isVideoFile(normalizedUrl)) {
          // Handle video
          loopingSource.pause()
          loopingSource.currentTime = 0
          loopingSource.loop = false
        } else {
          // Handle audio
          loopingSource.stop()
        }

        // Remove from active sources and looping tracks
        this.activeSources.delete(normalizedUrl)
        delete this.loopingTracks[normalizedUrl]

        return true
      } catch (err) {
        console.error('Error stopping looping track:', normalizedUrl, err)
        return false
      }
    },

    // Legacy methods for backward compatibility
    pauseVideoAudio(url) {
      return this.pauseTrack(url)
    },

    stopVideoAudio(url) {
      return this.stopTrack(url)
    },

    cleanup() {
      // Stop all active sources
      this.activeSources.forEach((sourceData, url) => {
        try {
          if (sourceData.type === 'video') {
            sourceData.source.pause()
            sourceData.source.currentTime = 0
          } else if (sourceData.source && typeof sourceData.source.stop === 'function') {
            sourceData.source.stop()
          }
        } catch (err) {
          console.error('Error during cleanup for:', url, err)
        }
      })

      // Clear the active sources
      this.activeSources.clear()

      // Clear looping tracks
      this.loopingTracks = {}

      // Close audio context if supported
      if (this.audioContext && typeof this.audioContext.close === 'function') {
        this.audioContext.close()
        this.audioContext = null
        this.analyser = null
        this.mixer = null
      }

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

    // Helper to check if video is currently playing
    isVideoPlaying(url) {
      // Normalize URL for consistent lookup
      const normalizedUrl = this.normalizeUrl(url)
      const activeSource = this.activeSources.get(normalizedUrl)

      if (!activeSource || activeSource.type !== 'video') return false

      const video = activeSource.source
      return !video.paused && !video.ended && video.readyState > 2
    },

    // Helper function to check if a track is currently looping
    isTrackLooping(url) {
      const normalizedUrl = this.normalizeUrl(url)
      return !!this.loopingTracks[normalizedUrl]
    },
    // Function to stop all sounds immediately
    stopAllSounds() {
      // Stop all active sources
      this.activeSources.forEach((sourceData, url) => {
        try {
          if (sourceData.type === 'video') {
            sourceData.source.pause()
            sourceData.source.currentTime = 0
            sourceData.source.loop = false
          } else if (sourceData.source && typeof sourceData.source.stop === 'function') {
            sourceData.source.stop()
          }
        } catch (e) {
          console.error('Error stopping source:', url, e)
        }
      })

      // Clear collections
      this.activeSources.clear()
      this.loopingTracks = {}
    },

    // Function to stop all videos only
    stopAllVideos() {
      const videosToStop = []

      // Find all active video sources
      this.activeSources.forEach((sourceData, url) => {
        if (sourceData.type === 'video') {
          videosToStop.push({ url, sourceData })
        }
      })

      // Stop each video
      videosToStop.forEach(({ url, sourceData }) => {
        try {
          sourceData.source.pause()
          sourceData.source.currentTime = 0
          sourceData.source.loop = false

          // Remove from active sources
          this.activeSources.delete(url)

          // Remove from looping tracks if it was looping
          if (this.loopingTracks[url]) {
            delete this.loopingTracks[url]
          }
        } catch (e) {
          console.error('Error stopping video:', url, e)
        }
      })

      return videosToStop.length // Return count of videos stopped
    },
  },
})
