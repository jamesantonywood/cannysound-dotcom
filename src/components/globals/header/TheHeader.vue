<script setup>
import TheLogo from '@/components/globals/TheLogo.vue'
import HeaderLinks from '@/components/globals/header/HeaderLinks.vue'
import HeaderLink from '@/components/globals/header/HeaderLink.vue'
import IconButton from '@/components/globals/header/IconButton.vue'

import { useAudioStore } from '@/stores/audioStore'
const audioStore = useAudioStore()

const handleLogoClick = () => {
  // audioStore.stopTrack('./src/assets/audio/background-ambience.mp3')
  audioStore.playTrack('./src/assets/audio/scratch.mp3')
  // audioStore.playLoopTrack('./src/assets/audio/background-ambience.mp3')
}
</script>

<template>
  <header>
    <HeaderLinks>
      <HeaderLink to="/about">About</HeaderLink>
      <HeaderLink to="/work">Work</HeaderLink>
    </HeaderLinks>
    <TheLogo @click="handleLogoClick" />
    <HeaderLinks>
      <HeaderLink to="/contact">Got a Project?</HeaderLink>
      <IconButton />
      <TheMobileMenu />
    </HeaderLinks>
  </header>
</template>
