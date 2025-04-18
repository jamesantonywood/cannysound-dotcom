<script setup>
import TheTitle from '@/components/globals/TheTitle.vue'
import TheWork from '@/components/work/TheWork.vue'
import { onMounted, onUnmounted } from 'vue'

import { useAudioStore } from '@/stores/audioStore'

const audio = useAudioStore()

// onMounted(() => {
//   audio.setVolume(0.2, 1.5)
//   // Load videos when component mounts

// })
onMounted(async () => {
  console.log('something')
  audio.setVolume(0.3, 2.0)
  // audio.stopLoopingTrack('./src/assets/audio/ambient-jazz.mp3')
  const videos = await audio.fetchVideosFromStrapi()

  // Now videos are available in audioStore.trackList
  console.log('Videos loaded:', audio.trackList)
})
onUnmounted(() => {
  // audio.stopAllSounds()
  // audio.playTrackLoop('./src/assets/audio/ambient-jazz.mp3')
  audio.setVolume(1.0, 2.0)
})
</script>

<template>
  <main>
    <TheTitle>Work</TheTitle>
    <TheWork />
  </main>
</template>
