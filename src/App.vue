<script setup>
import Lenis from 'lenis'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAudioStore } from './stores/audioStore'

import TheHeader from '@/components/globals/header/TheHeader.vue'
import TheVisualiser from './components/audioVisualiser/TheVisualiser.vue'

const audioStore = useAudioStore()
onMounted(async () => {
  // Initialize Lenis
  new Lenis({
    autoRaf: true,
  })
  // Initialize audio context
  audioStore.initAudioContext()
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
