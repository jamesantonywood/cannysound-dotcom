<script setup>
import { AnimatePresence, motion } from 'motion-v'
</script>

<template>
  <div class="title">
    <AnimatePresence>
      <motion.h1
        :initial="{ y: '200%' }"
        :animate="{
          y: 0,
          transition: {
            duration: 0.5,
            ease: 'backInOut',
          },
        }"
        :exit="{ y: '200%' }"
      >
        <slot></slot>
        <span class="word-fix"></span>
      </motion.h1>
    </AnimatePresence>
  </div>
</template>
