<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import TheTitle from '@/components/globals/TheTitle.vue'
import { motion } from 'motion-v'
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
      <TheTitle :responsive="true">About</TheTitle>
      <motion.p
        v-for="p in about"
        :key="p.children.text"
        :initial="{ opacity: 0.1 }"
        :whileInView="{
          opacity: 1,
        }"
        :inViewOptions="{
          margin: '0px',
          amount: 0.9,
        }"
      >
        <small v-if="p.children[0].italic">{{ p.children[0].text }}</small>
        <span v-else>{{ p.children[0].text }}</span>
      </motion.p>
      <!-- <p v-for="p in about.about_body.value" :key="p.children.text">
        {{ console.log(p.children.text) }}
      </p> -->
    </div>
  </main>
</template>

<style scoped></style>
