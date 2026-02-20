<script setup lang="ts">
import MyButton from './MyButton.vue'
import { ref, onMounted } from 'vue'

const isDark = ref(true)


const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// Sync with saved preference on load
onMounted(() => {
  isDark.value =
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark'
  
})
</script>

<template>
  <MyButton
    @click="toggleTheme"
severity="secondary"
    :full-width="true"
    label="Toggle theme"
    aria-label="Toggle theme"
    :icon="!isDark ? 'solar:moon-bold' : 'solar:sun-bold'"
  />
</template>
