<script setup>
import Lenis from 'lenis'
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { useAudioStore } from './stores/audioStore'
import { useThemeStore } from './stores/themeStore'

import TheHeader from '@/components/globals/header/TheHeader.vue'
import TheVisualiser from './components/audioVisualiser/TheVisualiser.vue'
import TheModal from './components/globals/TheModal.vue'

const themeStore = useThemeStore()
themeStore.initTheme()

let showModal = ref(true)
let isMuted = ref(false)

const closeModal = (status) => {
  console.log(status)
  if (status === 'muted') {
    isMuted.value = true
    audioStore.setVolume(0.0, 0.0)
    audioStore.stopAllSounds()
  } else {
    isMuted.value = false
    audioStore.setVolume(1.0, 0.0)
  }

  showModal.value = false
}

const audioStore = useAudioStore()
onMounted(async () => {
  // Initialize Lenis
  new Lenis({
    autoRaf: true,
  })
  // Initialize audio context
  audioStore.initAudioContext()
})
onUnmounted(() => {
  themeStore.cleanup()
})
</script>

<template>
  <!-- Its possible to do JS only transitions -->
  <div :class="themeStore.isDarkTheme ? 'dark-theme' : 'light-theme'">
    <div class="texture"></div>
    <div v-if="!showModal">
      <TheVisualiser />
      <TheHeader />
      <RouterView v-slot="{ Component }">
        <Transition name="fade">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
    <Teleport to="body">
      <TheModal
        @unmuted="console.log('unmuted')"
        @muted="console.log('muted')"
        @close="closeModal"
        :show="showModal"
      ></TheModal>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
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
