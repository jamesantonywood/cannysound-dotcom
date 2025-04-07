<script setup>
import TheLogo from '@/components/globals/TheLogo.vue'
import HeaderLinks from '@/components/globals/header/HeaderLinks.vue'
import HeaderLink from '@/components/globals/header/HeaderLink.vue'
import IconButton from '@/components/globals/header/IconButton.vue'
</script>

<template>
  <header>
    <HeaderLinks>
      <HeaderLink to="/about">About</HeaderLink>
      <HeaderLink to="/work">Work</HeaderLink>
    </HeaderLinks>
    <TheLogo />
    <HeaderLinks>
      <HeaderLink to="/contact">Got a Project?</HeaderLink>
      <IconButton />
    </HeaderLinks>
  </header>
</template>
