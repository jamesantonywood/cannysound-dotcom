<script setup>
import { useAudioStore } from '@/stores/audioStore'

let audioStore = useAudioStore()

defineProps({
  to: String,
})

const clicks = ['./src/assets/audio/Click1.mp3', './src/assets/audio/Click2.mp3']

const randomClick = () => {
  const randomIndex = Math.floor(Math.random() * clicks.length)
  return clicks[randomIndex]
}

const hovers = [
  './src/assets/audio/hover_1.mp3',
  './src/assets/audio/hover_2.mp3',
  './src/assets/audio/hover_3.mp3',
]
const randomHover = () => {
  const randomIndex = Math.floor(Math.random() * hovers.length)
  return hovers[randomIndex]
}
</script>

<template>
  <RouterLink
    class="header-link"
    :to="to"
    @click="audioStore.playTrack(randomClick())"
    @mouseenter="audioStore.playTrack(randomHover())"
  >
    <slot></slot>
  </RouterLink>
</template>
