<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import TheTitle from '@/components/globals/TheTitle.vue'
import { AnimatePresence, delay, motion } from 'motion-v'
const about = ref({})
onMounted(async () => {
  axios.get('http://localhost:1337/api/about').then((r) => {
    const body = r.data.data.about_body
    about.value = body
  })
})
</script>

<template>
  <main>
    <!-- <TheTitle>About</TheTitle> -->
    <div class="body">
      <TheTitle>About</TheTitle>
      <motion.p
        v-for="p in about"
        :key="p.children.text"
        :initial="{ opacity: 0.2 }"
        :whileInView="{
          opacity: 1,
        }"
        :inViewOptions="{
          margin: '0px',
          amount: 0.9,
        }"
        >{{ p.children[0].text }}</motion.p
      >
      <!-- <p v-for="p in about.about_body.value" :key="p.children.text">
        {{ console.log(p.children.text) }}
      </p> -->
      <p><small>Founded by Matthew Swinbourne</small></p>
    </div>
  </main>
</template>

<style scoped>
.body {
  padding-top: 20em;
  padding-bottom: 30em;

  width: 1024px;
  margin-left: auto;

  max-width: 100%;

  p {
    font-size: min(max(2em, 4vw), 4em);
    line-height: 1;
    margin-bottom: 0.5em;
    text-wrap: balance;
    small {
      font-weight: 300;
      font-size: 0.5em;
    }
  }
}
</style>
