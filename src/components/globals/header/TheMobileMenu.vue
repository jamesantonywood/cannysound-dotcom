<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useAudioStore } from '@/stores/audioStore'
const audioStore = useAudioStore()

const offCanvas = ref(null)

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

const handleMobileMenu = (event) => {
  event.preventDefault()
  audioStore.playTrack(randomClick())
  offCanvas.value.classList.toggle('active')
}

const handleMobileMenuClick = () => {
  offCanvas.value.classList.remove('active')
  audioStore.playTrack(randomClick())
}

const closeMobileMenu = () => {
  offCanvas.value.classList.remove('active')
  audioStore.playTrack(randomClick())
}
</script>

<template>
  <a
    href="#"
    class="mobile-menu"
    @click="handleMobileMenu"
    @mouseenter="audioStore.playTrack(randomHover())"
    >Menu</a
  >
  <div class="offcanvas-menu" ref="offCanvas">
    <div class="offcanvas-links">
      <!-- <RouterLink
        to="/"
        @click="handleMobileMenuClick"
        @mouseenter="audioStore.playTrack(randomHover())"
        >Home</RouterLink
      > -->
      <a
        @click="closeMobileMenu"
        @mouseenter="audioStore.playTrack(randomHover())"
        class="close-button"
        href="#"
        ><svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
          />
        </svg>
      </a>
      <RouterLink
        to="/about"
        @click="handleMobileMenuClick"
        @mouseenter="audioStore.playTrack(randomHover())"
        >About</RouterLink
      >
      <RouterLink
        to="/work"
        @click="handleMobileMenuClick"
        @mouseenter="audioStore.playTrack(randomHover())"
        >Work</RouterLink
      >
      <RouterLink
        to="/contact"
        @click="handleMobileMenuClick"
        @mouseenter="audioStore.playTrack(randomHover())"
        >Got a Project?</RouterLink
      >
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 768px) {
  .mobile-menu {
    display: none;
  }
}

.offcanvas-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-background);
  transform: translateY(100%);
  transition: transform 0.6s 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999;
  box-shadow: 0px -10px 20px rgba(0, 0, 0, 0.1);
  .offcanvas-links {
    svg {
      width: 1.5rem;
      height: 1.5rem;
      fill: var(--color-text);
      margin-bottom: 1rem;
    }
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    a {
      font-size: 2.5rem;
      font-weight: 600;
    }
  }
  &.active {
    transform: translateX(0);
  }
  @media screen and (min-width: 768px) {
    display: none;
  }
}
</style>
