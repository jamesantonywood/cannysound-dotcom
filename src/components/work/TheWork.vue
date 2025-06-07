<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import TheProject from './TheProject.vue'

const projects = ref([])
onMounted(() => {
  axios.get('/src/projects.json').then((r) => {
    projects.value = r.data.projects
  })
})
</script>

<template>
  <div class="projects" ref="root">
    <TheProject v-for="p in projects" :class="`project ${p.name}`" :key="p.name" :p="p" />
  </div>
</template>

<style>
.projects {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: end;
}
</style>
