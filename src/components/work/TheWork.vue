<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import TheProject from './TheProject.vue'

const projects = ref([])
onMounted(() => {
  axios.get('http://localhost:1337/api/projects?populate=*').then((r) => {
    projects.value = r.data.data
  })
})
</script>

<template>
  <div class="projects" ref="root">
    <TheProject v-for="p in projects" :class="`project ${p.id}`" :key="p.id" :p="p" />
  </div>
</template>

<style>
.projects {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: end;
  /* padding-top: 16px; */

  /* gap: 32px; */
  .project {
    /* width: 100%; */
    /* border: 1px solid red; */
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    min-width: 55vw;
    width: 872px;
    max-width: 100%;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: end;
    filter: blur(30px) grayscale(100%);
    transition: filter 1s cubic-bezier(0.34, 1.56, 0.64, 1);
    /* max-width: 1024px; */
    .media {
      aspect-ratio: 16/9;
      min-width: 55vw;
      width: 872px;
      max-width: 100%;
      border-radius: 10px;
      background: var(--color-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;

      video {
        overflow: hidden;
        /* width: 100%; */
        height: 100%;
        object-fit: contain;
        border-radius: 5px;
      }
    }
    &.is-visible {
      filter: blur(0px) grayscale(0%);
      .media {
      }
    }
    .meta {
      padding: 16px 0;
      display: flex;
      align-items: center;
      justify-content: end;
      gap: 16px;
      .meta-pill {
        padding: 0.25em 1em;
        background: var(--color-accent);
        border-radius: 5em;
      }
    }
  }
}
</style>
