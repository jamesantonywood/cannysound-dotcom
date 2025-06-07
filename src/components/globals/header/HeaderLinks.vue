<script setup></script>

<template>
  <div class="header-links">
    <slot></slot>
  </div>
</template>

<style>
.header-links {
  &:first-child {
    display: none;
  }
  flex-direction: row-reverse;
  /* justify-content: flex-start; */
  .header-link {
    display: none;
    &.mobile-menu {
      display: flex;
    }
  }
  display: flex;
  align-items: center;
  flex: 1 500px;
  gap: 0.75rem;

  a {
    font-size: 1.625rem;
  }
  &:last-child {
    /* justify-content: flex-end; */
  }
}
@media screen and (min-width: 768px) {
  .header-links {
    &:first-child {
      display: flex;
    }
    flex-direction: row;
    .header-link {
      display: flex;
      &.mobile-menu {
        display: none;
      }
    }
    &:last-child {
      justify-content: flex-end;
    }
  }
}

@media screen and (min-width: 1024px) {
  .header-links {
    gap: 2rem;
  }
}
</style>
