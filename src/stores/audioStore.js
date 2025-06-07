// src/stores/audioStore.js
import { defineStore } from 'pinia'

export const useAudioStore = defineStore('audio', {
  // State
  state: () => ({
    siteMute: false,
    isMuted: false,
    audioContext: null,
    analyser: null,
    mixer: null,
    audioBuffers: {},
    activeSources: new Map(),
    isVisualizationRunning: false,
    hasPlayedFirstTrack: false,
    trackList: [],
    isLoading: true,
    error: null,
    loopingTracks: {},
    volume: 1.0,
    transitionTime: 1.0,
    videoElements: {},

    // Mobile-specific state
    isContextUnlocked: false,
    needsUserGesture: true,
    isMobile: false,
  }),

  // Getters
  getters: {
    hasAudioContext: (state) => !!state.audioContext,
    isPlaying: (state) => state.activeSources.size > 0,
    firstTrack: (state) => state.trackList[0] || null,
    currentVolume: (state) => state.volume,
    canPlayAudio: (state) => state.isContextUnlocked && !state.needsUserGesture,
  },

  // Actions
  actions: {
    // Initialize and detect mobile
    init() {
      this.detectMobile()
      this.setupMobileListeners()
    },

    // Detect if we're on a mobile device
    detectMobile() {
      this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
      console.log('Mobile device detected:', this.isMobile)
    },

    // Set up listeners for mobile unlock
    setupMobileListeners() {
      if (this.isMobile) {
        // Listen for first user interaction
        const unlockEvents = ['touchstart', 'touchend', 'mousedown', 'click']

        const unlock = () => {
          this.unlockAudioContext()
          unlockEvents.forEach((event) => {
            document.removeEventListener(event, unlock, true)
          })
        }

        unlockEvents.forEach((event) => {
          document.addEventListener(event, unlock, true)
        })
      }
    },

    // Unlock audio context for mobile
    async unlockAudioContext() {
      if (this.isContextUnlocked) return true

      try {
        if (!this.audioContext) {
          this.initAudioContext()
        }

        // Resume the context
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume()
        }

        // Play a silent sound to unlock
        const buffer = this.audioContext.createBuffer(1, 1, 22050)
        const source = this.audioContext.createBufferSource()
        source.buffer = buffer
        source.connect(this.audioContext.destination)
        source.start(0)

        this.isContextUnlocked = true
        this.needsUserGesture = false

        console.log('Audio context unlocked for mobile')
        return true
      } catch (error) {
        console.error('Failed to unlock audio context:', error)
        return false
      }
    },

    initAudioContext() {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        this.analyser = this.audioContext.createAnalyser()
        this.mixer = this.audioContext.createGain()
        this.mixer.connect(this.analyser)
        this.analyser.connect(this.audioContext.destination)

        // Set initial volume
        this.setVolume(this.volume, 0)

        // Handle context state changes
        this.audioContext.addEventListener('statechange', () => {
          console.log('AudioContext state changed to:', this.audioContext.state)
          if (this.audioContext.state === 'suspended') {
            this.isContextUnlocked = false
          }
        })
      }
      return this.audioContext
    },

    // Enhanced volume setting with mobile considerations
    setVolume(value, transitionTime = null) {
      const transition = transitionTime !== null ? transitionTime : this.transitionTime
      const linearVolume = Math.max(0, Math.min(1, value))
      this.volume = linearVolume

      let taperedVolume = 0
      if (linearVolume > 0) {
        taperedVolume = Math.pow(linearVolume, 3)
      }

      if (this.mixer && this.audioContext) {
        const now = this.audioContext.currentTime
        const gainParam = this.mixer.gain

        gainParam.cancelScheduledValues(now)

        if (transition <= 0) {
          gainParam.setValueAtTime(taperedVolume, now)
        } else {
          gainParam.setValueAtTime(gainParam.value, now)
          if (taperedVolume > 0) {
            gainParam.exponentialRampToValueAtTime(
              Math.max(0.0001, taperedVolume),
              now + transition,
            )
          } else {
            gainParam.linearRampToValueAtTime(0, now + transition)
          }
        }
      }

      return linearVolume
    },

    setTransitionTime(seconds) {
      this.transitionTime = Math.max(0, seconds)
      return this.transitionTime
    },

    getAnalyser() {
      return this.analyser || null
    },

    isVideoFile(url) {
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']
      return videoExtensions.some((ext) => url.toLowerCase().includes(ext))
    },

    normalizeUrl(url) {
      try {
        const urlObj = new URL(url)
        return urlObj.pathname
      } catch {
        return url
      }
    },

    async fetchTrackList() {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('/sounds.json')
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

    async fetchVideos() {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('/projects.json')
        if (!response.ok) {
          throw new Error('Failed to load projects from JSON')
        }

        const data = await response.json()
        const videos = data.projects || []

        const processedVideos = videos.map((video) => ({
          name: video.name,
          url: video.video,
          type: 'video',
        }))

        this.trackList = [...this.trackList, ...processedVideos]
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
            await this.loadVideoAudio(track.url)
          } else {
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

    // Enhanced video loading for mobile
    async loadVideoAudio(url) {
      return new Promise((resolve, reject) => {
        const normalizedUrl = this.normalizeUrl(url)
        const video = document.createElement('video')

        // Mobile-specific video settings
        video.crossOrigin = 'anonymous'
        video.preload = 'metadata'
        video.playsInline = true // Critical for iOS
        video.muted = false // Don't mute initially
        video.controls = false

        // iOS-specific settings
        if (this.isMobile) {
          video.setAttribute('webkit-playsinline', 'true')
          video.setAttribute('playsinline', 'true')
        }

        video.src = url

        // Create audio source - but don't connect yet on mobile
        let videoSource = null
        try {
          if (this.audioContext) {
            videoSource = this.audioContext.createMediaElementSource(video)
          }
        } catch (err) {
          console.warn('Could not create media element source:', err)
        }

        this.videoElements[normalizedUrl] = {
          element: video,
          source: videoSource,
          connected: false,
          originalUrl: url,
        }

        video.addEventListener('loadedmetadata', () => {
          console.log(`Video metadata loaded: ${normalizedUrl}`)
          resolve(normalizedUrl)
        })

        video.addEventListener('error', (err) => {
          console.error(`Error loading video ${normalizedUrl}`, err)
          reject(err)
        })

        // Add to DOM but keep hidden
        video.style.display = 'none'
        video.style.position = 'absolute'
        video.style.top = '-9999px'
        video.style.left = '-9999px'
        video.style.width = '1px'
        video.style.height = '1px'
        document.body.appendChild(video)

        video.load()
      })
    },

    // Enhanced play methods with mobile support
    async playTrack(url) {
      // Ensure audio context is ready
      if (!this.audioContext) this.initAudioContext()

      // Try to unlock context if needed
      if (this.isMobile && !this.isContextUnlocked) {
        const unlocked = await this.unlockAudioContext()
        if (!unlocked) {
          console.warn('Audio context not unlocked - audio may not play')
        }
      }

      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume()
        } catch (err) {
          console.error('Failed to resume audio context:', err)
        }
      }

      if (this.isVideoFile(url)) {
        return this.playVideoAudio(url)
      }

      const buffer = this.audioBuffers[url]
      if (!buffer) {
        console.error('Audio buffer not found for:', url)
        return
      }

      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.mixer)
      source.start()

      this.activeSources.set(url, {
        source,
        type: 'audio',
        url,
        isLooping: false,
      })

      source.onended = () => {
        this.activeSources.delete(url)
      }

      this.hasPlayedFirstTrack = true
    },

    async playTrackLoop(url) {
      if (!this.audioContext) this.initAudioContext()

      if (this.isMobile && !this.isContextUnlocked) {
        const unlocked = await this.unlockAudioContext()
        if (!unlocked) {
          console.warn('Audio context not unlocked - audio may not play')
        }
      }

      if (this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume()
        } catch (err) {
          console.error('Failed to resume audio context:', err)
        }
      }

      if (this.loopingTracks[url]) {
        console.log(`Track ${url} is already looping`)
        return
      }

      if (this.isVideoFile(url)) {
        return this.playVideoAudioLoop(url)
      }

      const buffer = this.audioBuffers[url]
      if (!buffer) return

      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.mixer)
      source.loop = true
      source.start()

      this.activeSources.set(url, {
        source,
        type: 'audio',
        url,
        isLooping: true,
      })

      this.loopingTracks[url] = source
      this.hasPlayedFirstTrack = true

      return source
    },

    // Enhanced video playback for mobile
    async playVideoAudio(url) {
      const normalizedUrl = this.normalizeUrl(url)

      if (!this.videoElements[normalizedUrl]) {
        console.error(`Video not loaded: ${normalizedUrl}`)
        return
      }

      const videoData = this.videoElements[normalizedUrl]
      const video = videoData.element
      const source = videoData.source

      // Connect source to mixer if available and not connected
      if (source && !videoData.connected && this.mixer) {
        try {
          source.connect(this.mixer)
          videoData.connected = true
        } catch (err) {
          console.warn('Could not connect video source to mixer:', err)
        }
      }

      try {
        // Ensure video is ready for mobile
        if (this.isMobile) {
          video.muted = false
          video.playsInline = true
        }

        await video.play()

        this.activeSources.set(normalizedUrl, {
          source: video,
          type: 'video',
          url: normalizedUrl,
          isLooping: false,
        })

        video.onended = () => {
          this.activeSources.delete(normalizedUrl)
        }

        this.hasPlayedFirstTrack = true
        return videoData
      } catch (err) {
        console.error('Error playing video:', normalizedUrl, err)
        throw err
      }
    },

    async playVideoAudioLoop(url) {
      const normalizedUrl = this.normalizeUrl(url)

      if (!this.videoElements[normalizedUrl]) {
        console.error(`Video not loaded: ${normalizedUrl}`)
        return
      }

      if (this.loopingTracks[normalizedUrl]) {
        console.log(`Video ${normalizedUrl} is already looping`)
        return
      }

      const videoData = this.videoElements[normalizedUrl]
      const video = videoData.element
      const source = videoData.source

      if (source && !videoData.connected && this.mixer) {
        try {
          source.connect(this.mixer)
          videoData.connected = true
        } catch (err) {
          console.warn('Could not connect video source to mixer:', err)
        }
      }

      try {
        video.loop = true

        if (this.isMobile) {
          video.muted = false
          video.playsInline = true
        }

        await video.play()

        this.activeSources.set(normalizedUrl, {
          source: video,
          type: 'video',
          url: normalizedUrl,
          isLooping: true,
        })

        this.loopingTracks[normalizedUrl] = video
        this.hasPlayedFirstTrack = true

        return videoData
      } catch (err) {
        console.error('Error playing video loop:', normalizedUrl, err)
        throw err
      }
    },

    pauseTrack(url) {
      const normalizedUrl = this.normalizeUrl(url)
      const activeSource = this.activeSources.get(normalizedUrl)

      if (!activeSource) return false

      try {
        if (activeSource.type === 'video') {
          activeSource.source.pause()
        } else {
          activeSource.source.stop()
        }

        this.activeSources.delete(normalizedUrl)

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
      const normalizedUrl = this.normalizeUrl(url)
      const activeSource = this.activeSources.get(normalizedUrl)

      if (!activeSource) return false

      try {
        if (activeSource.type === 'video') {
          activeSource.source.pause()
          activeSource.source.currentTime = 0
          activeSource.source.loop = false
        } else {
          activeSource.source.stop()
        }

        this.activeSources.delete(normalizedUrl)

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
      const normalizedUrl = this.normalizeUrl(url)
      const loopingSource = this.loopingTracks[normalizedUrl]

      if (!loopingSource) return false

      try {
        if (this.isVideoFile(normalizedUrl)) {
          loopingSource.pause()
          loopingSource.currentTime = 0
          loopingSource.loop = false
        } else {
          loopingSource.stop()
        }

        this.activeSources.delete(normalizedUrl)
        delete this.loopingTracks[normalizedUrl]

        return true
      } catch (err) {
        console.error('Error stopping looping track:', normalizedUrl, err)
        return false
      }
    },

    // Legacy methods
    pauseVideoAudio(url) {
      return this.pauseTrack(url)
    },

    stopVideoAudio(url) {
      return this.stopTrack(url)
    },

    cleanup() {
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

      this.activeSources.clear()
      this.loopingTracks = {}

      if (this.audioContext && typeof this.audioContext.close === 'function') {
        this.audioContext.close()
        this.audioContext = null
        this.analyser = null
        this.mixer = null
      }

      Object.values(this.videoElements).forEach((videoData) => {
        const video = videoData.element
        video.pause()
        video.src = ''

        if (video.parentNode) {
          video.parentNode.removeChild(video)
        }

        if (videoData.source) {
          try {
            videoData.source.disconnect()
          } catch (err) {
            console.warn('Error disconnecting video source:', err)
          }
        }
      })

      this.videoElements = {}
      this.isContextUnlocked = false
      this.needsUserGesture = true
    },

    isVideoPlaying(url) {
      const normalizedUrl = this.normalizeUrl(url)
      const activeSource = this.activeSources.get(normalizedUrl)

      if (!activeSource || activeSource.type !== 'video') return false

      const video = activeSource.source
      return !video.paused && !video.ended && video.readyState > 2
    },

    isTrackLooping(url) {
      const normalizedUrl = this.normalizeUrl(url)
      return !!this.loopingTracks[normalizedUrl]
    },

    stopAllSounds() {
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

      this.activeSources.clear()
      this.loopingTracks = {}
    },

    stopAllVideos() {
      const videosToStop = []

      this.activeSources.forEach((sourceData, url) => {
        if (sourceData.type === 'video') {
          videosToStop.push({ url, sourceData })
        }
      })

      videosToStop.forEach(({ url, sourceData }) => {
        try {
          sourceData.source.pause()
          sourceData.source.currentTime = 0
          sourceData.source.loop = false

          this.activeSources.delete(url)

          if (this.loopingTracks[url]) {
            delete this.loopingTracks[url]
          }
        } catch (e) {
          console.error('Error stopping video:', url, e)
        }
      })

      return videosToStop.length
    },
  },
})
