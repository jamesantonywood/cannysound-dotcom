<script setup>
defineProps({
  show: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <Transition
    enter-from-class="opacity-0 scale-125"
    enter-to-class="opacity-100 scale-100"
    enter-active-class="transition duration-300"
    leave-active-class="transition duration-150"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-125"
  >
    <div v-if="show" class="modal-mask">
      <div class="modal-container">
        <div class="mb-5">
          <slot>default body</slot>
        </div>
        <footer>
          <slot name="footer">
            <button class="bg-gray-400 px-4 py-2 rounded" @click="$emit('close')">close</button>
          </slot>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
}

.modal-container {
  background: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  width: 80vw;
  max-width: 500px;
}
</style>
