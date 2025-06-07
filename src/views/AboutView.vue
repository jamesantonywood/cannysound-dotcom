<script setup>
import TheTitle from '@/components/globals/TheTitle.vue'
import { motion } from 'motion-v'
</script>

<template>
  <main>
    <!-- <TheTitle>About</TheTitle> -->
    <div class="body">
      <TheTitle :responsive="true">About</TheTitle>
      <motion.p
        :initial="{ opacity: 0.1 }"
        :whileInView="{
          opacity: 1,
        }"
        :inViewOptions="{
          margin: '0px',
          amount: 0.9,
        }"
      >
        Canny Sound is a music production studio based in the UK, specialising in sound design,
        composition and audio mixing.
      </motion.p>
      <motion.p
        :initial="{ opacity: 0.1 }"
        :whileInView="{
          opacity: 1,
        }"
        :inViewOptions="{
          margin: '0px',
          amount: 0.9,
        }"
      >
        Some of our work includes creating bespoke audio for creative campaigns, composing original
        music for commercials and creating a sonic identity for new and established brands.
      </motion.p>
      <motion.p
        :initial="{ opacity: 0.1 }"
        :whileInView="{
          opacity: 1,
        }"
        :inViewOptions="{
          margin: '0px',
          amount: 0.9,
        }"
      >
        <small>Founded by Matthew Swinbourne</small>
      </motion.p>

      <!-- <p v-for="p in about.about_body.value" :key="p.children.text">
        {{ console.log(p.children.text) }}
      </p> -->
    </div>
  </main>
</template>

<style scoped></style>
