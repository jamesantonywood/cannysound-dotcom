<script setup>
import { vIntersectionObserver } from '@vueuse/components'
import { onMounted, ref, shallowRef } from 'vue'
import { useAudioStore } from '@/stores/audioStore'

const audio = useAudioStore()

const props = defineProps({
  p: Object,
})

const p = props.p
const videoRef = ref(null)
const playbackButton = ref(null)

const isPlaying = ref(false)
const isMuted = audio.isMuted

const isVisible = shallowRef(false)

// videoRef.value.addEventListener('pause', () => {
//   // console.log('video loaded')
// })

function onIntersectionObserver([entry]) {
  const video = entry.target.querySelector('video')
  if ((isVisible.value = entry.isIntersecting || false)) {
    entry.target.classList.add('is-visible')
    // videoRef.value.play()
  } else {
    entry.target.classList.remove('is-visible')
    videoRef.value.pause()
    videoRef.value.currentTime = 0
    audio.stopTrack(videoRef.value.src)
    isPlaying.value = false
  }
}

// const test = (url) => {
//   audio.stopAllSounds()
//   audio.setVolume(1.0, 0.0)
//   videoRef.value.currentTime = 0.0
//   videoRef.value.play()
//   audio.playVideoAudio(url)
// }

const playVideo = () => {
  if (!videoRef.value) return
  if (videoRef.value.paused === false) {
    videoRef.value.pause()
    isPlaying.value = false
    audio.pauseTrack(videoRef.value.src)
    return
  }
  // TODO: handle play and pause better
  audio.stopAllSounds()
  if (!isMuted.value) {
    audio.setVolume(1.0, 0.0)
  } else {
    audio.setVolume(0.0, 0.0)
  }
  isPlaying.value = true
  videoRef.value.play()
  audio.playTrack(videoRef.value.src)
}

const handlePause = () => {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    isPlaying.value = false
    audio.pauseTrack(videoRef.value.src)
    if (!audio.isMuted) {
      audio.setVolume(0.5, 0.0)
      audio.playTrackLoop('/audio/background-ambience.mp3')
    }
  }
}

const getDesctiption = (description) => {
  const t = document.createElement('template')
  t.innerHTML = description
  return t.content.textContent
}

const restartVideo = () => {
  if (!videoRef.value) return
  audio.stopTrack(videoRef.value.src)
  videoRef.value.currentTime = 0.0
  if (videoRef.value.paused === false) {
    audio.playTrack(videoRef.value.src)
  }
}

const muteVideo = () => {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  if (videoRef.value.muted) {
    audio.isMuted = true
    audio.setVolume(0.0, 0.0)
  } else {
    audio.setVolume(1.0, 0.0)
    audio.isMuted = false
  }
}

const openFullscreen = () => {
  if (!videoRef.value) return
  if (videoRef.value.requestFullscreen) {
    videoRef.value.requestFullscreen()
  } else if (videoRef.value.mozRequestFullScreen) {
    videoRef.value.mozRequestFullScreen() // Firefox
  } else if (videoRef.value.webkitRequestFullscreen) {
    videoRef.value.webkitRequestFullscreen() // Chrome, Safari and Opera
  } else if (videoRef.value.msRequestFullscreen) {
    videoRef.value.msRequestFullscreen() // IE/Edge
  }
}

const handleVideoEnd = () => {
  videoRef.value.currentTime = 0.0
  audio.stopTrack(videoRef.value.src)
  isPlaying.value = false
  if (!audio.isMuted) {
    audio.setVolume(0.5, 0.0)
    audio.playTrackLoop('/audio/background-ambience.mp3')
  }
  console.log('ended!')
}

onMounted(() => {
  // console.log(videoRef.value)
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
    <div class="content">
      <h2>{{ p.name }}</h2>
      <p>
        {{ getDesctiption(p.description) }}
      </p>
      <div class="meta">
        <div class="meta-pill" v-for="t in p.tags" :key="t">{{ t }}</div>
      </div>
    </div>
    <div class="media">
      <div class="video">
        <video
          ref="videoRef"
          :src="p.video"
          playsinline="true"
          @ended="handleVideoEnd"
          @pause="handlePause"
          :muted="audio.isMuted"
        ></video>
        <div class="video-controls">
          <div class="control" @click="playVideo" ref="playbackButton">
            <svg
              v-if="isPlaying"
              width="12"
              height="14"
              viewBox="0 0 12 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 14V0H12V14H8ZM0 14V0H4V14H0Z" />
            </svg>

            <svg
              v-else
              width="11"
              height="14"
              viewBox="0 0 11 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0V14L11 7L0 0Z" />
            </svg>
          </div>
          <div class="control" @click="restartVideo">
            <svg
              width="15"
              height="17"
              viewBox="0 0 15 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.8475 7.80809C14.652 6.82893 14.2682 5.89898 13.7183 5.07195C13.1797 4.25717 12.4921 3.55589 11.6933 3.00645C10.8815 2.44755 9.97014 2.05627 9.01083 1.8547C8.50676 1.75026 7.99351 1.69899 7.47916 1.7017V0L4.16666 2.55L7.47916 5.1V3.4017C7.88249 3.4 8.28583 3.4391 8.67499 3.5207C9.42059 3.67742 10.1289 3.98149 10.76 4.41575C11.382 4.84342 11.9174 5.38946 12.3367 6.02395C12.9876 7.00596 13.3348 8.16457 13.3333 9.34999C13.3339 10.1456 13.178 10.9332 12.875 11.6662C12.7284 12.0197 12.5487 12.3579 12.3383 12.676C12.1284 12.9932 11.8889 13.2889 11.6233 13.5592C10.8166 14.3804 9.79255 14.9437 8.67666 15.1801C7.90067 15.3406 7.10099 15.3406 6.32499 15.1801C5.57904 15.0233 4.87043 14.7189 4.23916 14.2842C3.61787 13.8569 3.08313 13.3115 2.66416 12.6777C2.01398 11.6947 1.66662 10.5358 1.66667 9.34999H2.69315e-08C-0.000126628 10.8748 0.44648 12.3648 1.2825 13.6289C1.82243 14.4416 2.5091 15.142 3.30583 15.6927C4.54385 16.5473 6.00509 17.0028 7.49999 17C8.00774 17.0005 8.51423 16.9483 9.01166 16.8444C9.97069 16.6428 10.8817 16.2515 11.6933 15.6927C12.0915 15.4183 12.463 15.1055 12.8025 14.7585C13.1429 14.412 13.4499 14.0328 13.7192 13.6263C14.5564 12.3639 15.0027 10.8741 15 9.34999C15.0005 8.83209 14.9494 8.31547 14.8475 7.80809Z"
                fill="white"
              />
            </svg>
          </div>
          <div class="control" @click="muteVideo">
            <svg
              width="14"
              height="16"
              viewBox="0 0 14 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                v-if="!audio.isMuted"
                d="M11.1531 8C11.1531 6.89062 10.475 5.94063 9.5125 5.54063L9 6.77187C9.48125 6.97187 9.81875 7.44688 9.81875 8.00313C9.81875 8.55625 9.48125 9.03125 9 9.23438L9.5125 10.4656C10.475 10.0594 11.1531 9.10938 11.1531 8ZM10.5375 3.07812L10.025 4.30937C11.4719 4.9125 12.4875 6.3375 12.4875 8C12.4875 9.66562 11.4719 11.0875 10.025 11.6906L10.5375 12.9219C12.4656 12.1187 13.8187 10.2188 13.8187 8C13.8187 5.78125 12.4656 3.88125 10.5375 3.07812Z"
              />
              <path d="M0 4.66563V11.3313H2.66563L7.33125 16V0L2.66563 4.66563H0Z" />
            </svg>
          </div>
          <div class="control" @click="openFullscreen">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 0V6H16V3.41L12.71 6.71L11.29 5.29L14.59 2H12V0H18ZM0 0V6H2V3.41L5.29 6.71L6.71 5.29L3.41 2H6V0H0ZM18 18V12H16V14.59L12.71 11.3L11.3 12.71L14.59 16H12V18H18ZM6 18V16H3.41L6.7 12.71L5.29 11.29L2 14.59V12H0V18H6Z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.project {
  /* width: 100%; */
  /* border: 1px solid red; */
  width: 100vw;
  max-width: 100%;
  min-height: 100svh;
  display: flex;
  flex-direction: column-reverse;

  align-items: center;
  justify-content: flex-end;
  filter: blur(30px) grayscale(100%);
  transition: filter 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  /* padding: 7.5rem 0; */
  padding-bottom: 2rem;
  gap: 2rem;
  /* flex-wrap: wrap; */
  .content {
    max-width: 500px;

    h2 {
      font-size: 2rem;
      text-wrap: balance;
      font-weight: 600;
      line-height: 1;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1rem;
      text-transform: none;
    }
    /* max-width: 400px; */
    /* position: fixed;
    top: 0;
    left: 0; */
  }
  /* max-width: 1024px; */
  .media {
    .video {
      width: 100%;
      max-width: 100vw;
      border-radius: 10px;
      border: 1px solid var(--color-accent);
      background: var(--color-background);
      display: flex;
      flex-direction: column;
      align-items: start;
      justify-content: space-between;
      padding: 8px;
      video {
        overflow: hidden;
        background: var(--force-black);
        /* padding: 0.5rem; */
        border-radius: 10px;
        overflow: hidden;
        /* width: 100%; */
        height: 100%;
        object-fit: contain;
        border-radius: 5px;
      }
    }
  }
  &.is-visible {
    filter: blur(0px) grayscale(0%);
  }
  .meta {
    padding: 2rem 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: start;
    gap: 0.5rem;
    .meta-pill {
      padding: 0.25em 1em;
      font-size: 0.825rem;
      background: var(--color-accent);
      border-radius: 5em;
    }
  }
  .video-controls {
    display: flex;
    flex-grow: 1;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    gap: 0.5rem;
    padding: 1rem 0.5rem 0.5rem;

    .control {
      width: 2rem;
      height: 2rem;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-accent);
      border-radius: 50%;
      cursor: pointer;
      svg {
        path {
          fill: var(--color-text);
        }
      }
    }
  }
  @media screen and (min-width: 1024px) {
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 0;
    .media {
      .video {
        aspect-ratio: 15/9;
        flex-direction: row;
        min-width: 600px;
      }
    }
    .content {
      h2 {
        font-size: 3rem;
      }
      p {
        font-size: 1.125rem;
      }
    }
    .video-controls {
      flex-direction: column;
      padding: 1rem;
      .control {
        width: 3rem;
        height: 3rem;
      }
    }
    @media screen and (min-width: 1380px) {
      .media {
        .video {
          min-width: 872px;
          width: 55vw;
        }
      }
    }
  }
}
</style>
