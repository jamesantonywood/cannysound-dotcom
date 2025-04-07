<script setup>
const projects = [
  {
    thumbnail: '/img/work/placeholder-1.jpg',
    name: 'test-1',
  },
  {
    thumbnail: '/img/work/placeholder-2.jpg',
    name: 'test-2',
  },
  {
    thumbnail: '/img/work/placeholder-3.jpg',
    name: 'test-2',
  },
  {
    thumbnail: '/img/work/placeholder-4.jpg',
    name: 'test-2',
  },
]
</script>

<template>
  <div class="projects">
    <div v-for="p in projects" class="project" :key="p.name">
      <div class="media">
        <img :src="p.thumbnail" alt="" />
      </div>
      <div class="meta">
        <div class="meta-pill">Sound Design</div>
        <div class="meta-pill">Production</div>
        <div class="meta-pill">March 2025</div>
      </div>
    </div>
  </div>
</template>

<style>
.projects {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: end;
  padding-top: 16px;
  padding-bottom: 100px;
  gap: 32px;
  .project {
    width: 100%;
    max-width: 1024px;
    .media {
      aspect-ratio: 16/9;
      border-radius: 10px;
      background: var(--hover);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 10px;
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
        background: var(--hover);
        border-radius: 5em;
      }
    }
  }
}
</style>
