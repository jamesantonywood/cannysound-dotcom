<script setup>
import { useAudioStore } from '@/stores/audioStore'

let audioStore = useAudioStore()

defineProps({
  to: String,
})

const tracks = [
  './src/assets/audio/pop-up.mp3',
  './src/assets/audio/zoom.wav',
  './src/assets/audio/click.mp3',
]
</script>

<template>
  <RouterLink
    :to="to"
    @mouseenter="audioStore.playTrack('./src/assets/audio/zoom.wav')"
    @click="audioStore.playTrack('./src/assets/audio/ding.mp3')"
  >
    <slot></slot>
  </RouterLink>
</template>
