<script setup>
// import emit from 'vue'
defineProps({
  show: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <Transition>
    <div v-if="show" class="modal-mask">
      <div class="modal-container">
        <div class="">
          <slot>
            <h2>It would be sound if you enabled audio</h2>
            <p>
              This site showcases our sound design. If you want to browse this site in silence we
              don’t mind if you mute our hard work,
            </p>
          </slot>
        </div>
        <footer>
          <slot name="footer">
            <button class="primary" @click="$emit('close', 'unmuted')">Enable Audio</button>
            <button class="secondary" @click="$emit('close', 'muted')">Stay Muted</button>
          </slot>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background-color: var(--color-background);
  display: grid;
  place-items: center;
}

.modal-container {
  border: 1px solid var(--color-text);
  padding: 2rem 2rem;
  border-radius: 0.5rem;
  width: 80vw;
  max-width: 800px;
  text-align: center;
  h2 {
    font-size: min(max(1.5em, 6vw), 3em);
    font-weight: 600;
    line-height: 1;
    margin-bottom: 1rem;
  }
  p {
    font-weight: 300;
    margin-bottom: 1rem;
  }
  button {
    background: none;
    border: 1px solid var(--color-text);
    padding: 0.5rem 2rem;
    border-radius: 4rem;
    outline: none;
    color: var(--color-text);
    margin: 0.5rem;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
    &.primary {
      background-color: var(--color-text);
      color: var(--color-background);
    }
    &:hover {
      cursor: pointer;
      background-color: var(--color-text);
      color: var(--color-background);
    }
  }
}
</style>
