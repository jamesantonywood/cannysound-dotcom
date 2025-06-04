<script setup></script>

<template>
  <div class="header-links">
    <slot></slot>
  </div>
</template>

<style>
.header-links {
  display: none;
  align-items: center;
  flex: 1 500px;

  a {
    font-size: 1.625rem;
  }
  &:last-child {
    justify-content: flex-end;
  }
}
@media screen and (min-width: 768px) {
  .header-links {
    display: flex;
    gap: 0.75rem;
  }
}

@media screen and (min-width: 1024px) {
  .header-links {
    gap: 2rem;
  }
}
</style>
