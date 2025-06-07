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
let videos
onMounted(async () => {
  if (!audio.isMuted) {
    audio.setVolume(0.5, 2.0)
  }
  videos = await audio.fetchVideos()
})
onUnmounted(() => {
  audio.stopAllVideos()
  audio.playTrackLoop('/audio/background-ambience.mp3')
  if (!audio.isMuted) {
    audio.setVolume(1.0, 2.0)
  }
})
</script>

<template>
  <main>
    <TheTitle :responsive="true">Work</TheTitle>
    <TheWork />
  </main>
</template>

<style scoped>
body {
  /* overflow: hidden;
  margin: 0;
  height: 100%; */
}
.projects::-webkit-scrollbar {
  /* display: none; Chrome/Safari */
}
.projects {
  /* height: 100vh !important;
  border: 1px solid blue;
  overflow-y: none;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  scroll-snap-points-y: repeat(100vh); */

  /* Optional: hide scrollbar for cleaner look */
  /* scrollbar-width: none; Firefox */
  /* -ms-overflow-style: none; IE/Edge */
  .project {
    /* height: 100vh;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative; */
  }
}
main {
  padding-top: 134px;
  @media screen and (min-width: 1024px) {
    padding-top: 0;
  }
}
</style>
