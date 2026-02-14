<script setup lang="ts">
interface Props {
  label: string;
}

const props = defineProps<Props>();
</script>

<template>
  <button
    class="font-bold text-white rounded-md px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-600 transition-colors"
  >
    {{ props.label }}
  </button>
</template>
