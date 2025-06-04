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
  if (audio.volume !== 0) {
    audio.setVolume(0.3, 2.0)
  }
  const videos = await audio.fetchVideosFromStrapi()
})
onUnmounted(() => {
  // audio.setVolume(1.0, 2.0)
})
</script>

<template>
  <main>
    <TheTitle :responsive="true">Work</TheTitle>
    <TheWork />
  </main>
</template>

<style scoped>
main {
  padding-top: 134px;
  @media screen and (min-width: 1024px) {
    padding-top: 0;
  }
}
</style>
