<script setup>
import { ref } from 'vue'
import { useAudioStore } from '@/stores/audioStore'
const audioStore = useAudioStore()
const copyLink = ref(null)
const copyEmail = async (myText) => {
  try {
    await navigator.clipboard.writeText(myText)
    copyLink.value.querySelector('span').textContent = 'Copied'
    console.log('Copied: ', myText)
  } catch (e) {
    console.warn('Cannot copy: ', myText, e)
  }
}
const hovers = [
  './src/assets/audio/hover_1.mp3',
  './src/assets/audio/hover_2.mp3',
  './src/assets/audio/hover_3.mp3',
]
const randomHover = () => {
  const randomIndex = Math.floor(Math.random() * hovers.length)
  return hovers[randomIndex]
}

const clicks = ['./src/assets/audio/Click1.mp3', './src/assets/audio/Click2.mp3']

const randomClick = () => {
  const randomIndex = Math.floor(Math.random() * clicks.length)
  return clicks[randomIndex]
}

const copySound = () => {
  copyEmail('hello@cannysound.co.uk')
  audioStore.playTrack('./src/assets/audio/screenshot.mp3')
}
</script>

<template>
  <main>
    <div class="body">
      <!-- <p class="small">Get in touch.</p> -->
      <div class="contact">
        <p class="email">
          <a
            href="mailto:hello@cannysound.co.uk"
            @mouseenter="audioStore.playTrack('./src/assets/audio/GotaProject.mp3')"
            @click="audioStore.playTrack(randomClick())"
            >hello@cannysound.co.uk</a
          >
        </p>
        <a href="#" class="button" ref="copyLink" @click="copySound">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.1 5.4C16.85 5.15 16.5 5 16.15 5H12.5V1.35C12.5 0.99 12.36 0.65 12.1 0.4C11.84 0.15 11.5 0 11.15 0H1.35C0.99 0 0.65 0.14 0.4 0.4C0.15 0.66 0 1 0 1.35V11.15C0 11.51 0.14 11.85 0.4 12.1C0.66 12.35 0.99 12.5 1.35 12.5H5V16.15C5 16.51 5.14 16.85 5.4 17.1C5.66 17.35 5.99 17.5 6.35 17.5H16.15C16.51 17.5 16.85 17.36 17.1 17.1C17.35 16.84 17.5 16.51 17.5 16.15V6.35C17.5 5.99 17.36 5.65 17.1 5.4ZM1.5 11V1.5H11V5H6.35C5.99 5 5.65 5.14 5.4 5.4C5.15 5.66 5 6 5 6.35V11H1.5ZM16 16H6.5V6.5H16V16Z"
            />
          </svg>
          <span @click="copySound">Copy email address</span>
        </a>
      </div>
      <div class="instagram">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.8 0H14.2C17.4 0 20 2.6 20 5.8V14.2C20 15.7383 19.3889 17.2135 18.3012 18.3012C17.2135 19.3889 15.7383 20 14.2 20H5.8C2.6 20 0 17.4 0 14.2V5.8C0 4.26174 0.61107 2.78649 1.69878 1.69878C2.78649 0.61107 4.26174 0 5.8 0ZM5.6 2C4.64522 2 3.72955 2.37928 3.05442 3.05442C2.37928 3.72955 2 4.64522 2 5.6V14.4C2 16.39 3.61 18 5.6 18H14.4C15.3548 18 16.2705 17.6207 16.9456 16.9456C17.6207 16.2705 18 15.3548 18 14.4V5.6C18 3.61 16.39 2 14.4 2H5.6ZM15.25 3.5C15.5815 3.5 15.8995 3.6317 16.1339 3.86612C16.3683 4.10054 16.5 4.41848 16.5 4.75C16.5 5.08152 16.3683 5.39946 16.1339 5.63388C15.8995 5.8683 15.5815 6 15.25 6C14.9185 6 14.6005 5.8683 14.3661 5.63388C14.1317 5.39946 14 5.08152 14 4.75C14 4.41848 14.1317 4.10054 14.3661 3.86612C14.6005 3.6317 14.9185 3.5 15.25 3.5ZM10 5C11.3261 5 12.5979 5.52678 13.5355 6.46447C14.4732 7.40215 15 8.67392 15 10C15 11.3261 14.4732 12.5979 13.5355 13.5355C12.5979 14.4732 11.3261 15 10 15C8.67392 15 7.40215 14.4732 6.46447 13.5355C5.52678 12.5979 5 11.3261 5 10C5 8.67392 5.52678 7.40215 6.46447 6.46447C7.40215 5.52678 8.67392 5 10 5ZM10 7C9.20435 7 8.44129 7.31607 7.87868 7.87868C7.31607 8.44129 7 9.20435 7 10C7 10.7956 7.31607 11.5587 7.87868 12.1213C8.44129 12.6839 9.20435 13 10 13C10.7956 13 11.5587 12.6839 12.1213 12.1213C12.6839 11.5587 13 10.7956 13 10C13 9.20435 12.6839 8.44129 12.1213 7.87868C11.5587 7.31607 10.7956 7 10 7Z"
          />
        </svg>
        <a
          href="https://www.instagram.com/cannysound/"
          target="_blank"
          rel="noopener noreferrer"
          @mouseenter="audioStore.playTrack(randomHover())"
          @click="audioStore.playTrack(randomClick())"
          >@cannysound</a
        >
      </div>
    </div>
  </main>
</template>

<style scoped>
.body {
  margin: auto;
  padding: 0;
}

p {
  margin: 0;
}

.contact {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1.5em 0 3em;
  gap: 1rem;
  .email {
    font-size: min(max(1.5em, 6vw), 4em);
  }
  .button {
    margin-top: 1rem;
    padding: 1rem 2rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-text);
    border-radius: 50px;
    text-decoration: none;
    font-size: min(max(1em, 3vw), 1.5em);
    display: flex;
    align-items: center;
    gap: 1rem;

    &:hover {
      cursor: pointer;
    }
    &:after {
      content: unset;
    }
  }
}

.instagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  /* margin-top: 2rem; */
  line-height: 1;
  font-size: min(max(1em, 3vw), 1.5em);
}

svg {
  width: 1.25em;
  height: 1.25em;
  margin: 0;
  path {
    fill: var(--color-text);
  }
}
</style>
