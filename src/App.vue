<script setup>
import Lenis from 'lenis'
import { RouterView } from 'vue-router'
import TheHeader from '@/components/globals/header/TheHeader.vue'
import { AnimatePresence } from 'motion-v'
import TheVisualiser from './components/audioVisualiser/TheVisualiser.vue'

// Initialize Lenis
new Lenis({
  autoRaf: true,
})

// Listen for the scroll event and log the event data
// lenis.on('scroll', (e) => {
//   console.log(e)
// })

// const bg = document.createElement('audio')
// console.log('@/assets/audio/vinyl-textures.mp3')
// bg.setAttribute('src', '/audio/vinyl-textures.mp3')
// bg.setAttribute('autoplay', 'autoplay')
// bg.loop = true
// let playing = false
document.addEventListener('click', () => {
  // if (playing) {
  //   bg.pause()
  //   playing = false
  // } else {
  //   bg.play()
  //   playing = true
  // }
})
</script>

<template>
  <!-- Its possible to do JS only transitions -->
  <TheVisualiser />
  <div class="texture"></div>
  <TheHeader />
  <RouterView v-slot="{ Component }">
    <Transition name="fade">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-to .fade-leave-from {
  opacity: 1;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
