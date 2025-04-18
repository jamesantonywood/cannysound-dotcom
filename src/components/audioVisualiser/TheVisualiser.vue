<template>
  <div class="audio-visualizer">
    <canvas ref="spectrumCanvas" class="spectrum-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAudioStore } from '@/stores/audioStore'

// Access the audio store
const audioStore = useAudioStore()

// Local refs
const spectrumCanvas = ref(null)
let animationFrameId = null

// Draw spectrum visualization
const drawSpectrum = () => {
  if (!spectrumCanvas.value) return

  const canvas = spectrumCanvas.value
  const ctx = canvas.getContext('2d')
  const analyser = audioStore.getAnalyser()

  if (!analyser) return

  // Set canvas to be full window size
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Clear canvas
  ctx.fillStyle =
    window.getComputedStyle(document.body).getPropertyValue('--color-background') || '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw frequency waveform
  drawFFTWaveform(
    ctx,
    analyser,
    canvas.width,
    canvas.height / 2,
    window.getComputedStyle(document.body).getPropertyValue('--color-accent') || '#fff',
  )

  // Continue animation loop
  if (audioStore.isVisualizationRunning) {
    animationFrameId = requestAnimationFrame(drawSpectrum)
  }
}

// Full-screen FFT waveform visualization using native Canvas API
const drawFFTWaveform = (ctx, analyser, width, height, fgColor) => {
  // Save the current drawing state
  ctx.save()

  // Set line properties
  ctx.lineWidth = 2
  ctx.strokeStyle = fgColor

  // Get frequency data using FFT
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteTimeDomainData(dataArray)

  // Begin drawing the path
  ctx.beginPath()

  // Calculate the step to fit all points on screen
  const sliceWidth = width / bufferLength

  // Draw the waveform across the entire screen
  for (let i = 0; i < bufferLength; i++) {
    // Convert frequency data (0-255) to range (-1 to 1)
    const v = (dataArray[i] - 127.5) / 127.5

    // Map the -1 to 1 range to the canvas height
    const y = height * (1 - v * 0.8) // 0.1 is the amplitude
    const x = i * sliceWidth

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  // Draw the stroke
  ctx.stroke()

  // Restore the previous drawing state
  ctx.restore()
}

// Handle window resize
const handleResize = () => {
  if (spectrumCanvas.value) {
    spectrumCanvas.value.width = window.innerWidth
    spectrumCanvas.value.height = window.innerHeight
  }
}

// Start visualization
const startVisualization = () => {
  audioStore.isVisualizationRunning = true
  drawSpectrum()
}

// Stop visualization
const stopVisualization = () => {
  audioStore.isVisualizationRunning = false
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

// Lifecycle hooks
onMounted(async () => {
  // Initialize audio context
  audioStore.initAudioContext()

  // Fetch track list from JSON
  await audioStore.fetchTrackList()

  // Start visualization
  startVisualization()

  // Add resize event listener
  window.addEventListener('resize', handleResize)

  audioStore.playTrackLoop('./src/assets/audio/ambient-jazz.mp3')
})

onBeforeUnmount(() => {
  // Clean up resources
  stopVisualization()

  // Remove event listener
  window.removeEventListener('resize', handleResize)

  // Clean up audio resources
  audioStore.cleanup()
})
</script>

<style scoped>
.audio-visualizer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
}

button {
  position: absolute;
  z-index: 10000;
}

.spectrum-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  z-index: 10;
}

.error-overlay {
  background-color: rgba(220, 53, 69, 0.7);
}
</style>
