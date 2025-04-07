<script setup>
// import TheTitle from '@/components/globals/TheTitle.vue'
</script>

<template>
  <main>
    <!-- <TheTitle>About</TheTitle> -->
    <div class="body">
      <h1>About</h1>
      <p>
        Canny Sound is a music production studio based in the UK, specialising in sound design,
        composition and audio mixing.
      </p>

      <p>
        Some of our work includes creating bespoke audio for creative campaigns, composing original
        music for commercials and creating a sonic identity for new and established brands.
      </p>

      <p><small>Founded by Matthew Swinbourne</small></p>
    </div>
  </main>
</template>

<style>
.body {
  padding-bottom: 15em;
  h1 {
    font-size: 6rem;
    font-weight: 900;
  }
  p {
    font-size: 5rem;
    line-height: 1;
    margin-bottom: 0.5em;
    text-wrap: balance;
    small {
      font-weight: 300;
      font-size: 0.5em;
    }
  }
}
</style>
