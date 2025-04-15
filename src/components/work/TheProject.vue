<script setup>
import { vIntersectionObserver } from '@vueuse/components'
import { onMounted, ref, shallowRef } from 'vue'

const props = defineProps({
  p: Object,
})

const p = props.p
const videoRef = ref(null)

const isVisible = shallowRef(false)

function onIntersectionObserver([entry]) {
  const video = entry.target.querySelector('video')
  if ((isVisible.value = entry.isIntersecting || false)) {
    entry.target.classList.add('is-visible')
    video.play()
  } else {
    entry.target.classList.remove('is-visible')
    video.pause()
    video.currentTime = 0
  }
}

const handleVideoEnd = () => {
  console.log('ended!')
}

onMounted(() => {
  console.log(videoRef.value)
})
</script>

<template>
  <div
    class="project"
    v-intersection-observer="[
      onIntersectionObserver,
      {
        threshold: [0.6],
      },
    ]"
  >
    <div class="media">
      <video
        ref="videoRef"
        :src="'http://localhost:1337' + p.video.url"
        playsinline="true"
        autoplay
        muted
        @ended="handleVideoEnd"
      ></video>
    </div>
    <div class="meta">
      <div class="meta-pill" v-for="c in p.categories" :key="c.id">{{ c.name }}</div>
      <div class="meta-pill">{{ p.completed }}</div>
    </div>
  </div>
</template>
