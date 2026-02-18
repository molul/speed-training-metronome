<script setup lang="ts">
import { inject } from 'vue'
import MyButton from './MyButton.vue'

const dialogRef = inject('dialogRef') as any

const { message, confirmLabel, confirmSeverity } = dialogRef.value.data

const close = (confirmed: boolean) => {
  dialogRef.value.close({ confirmed })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <p class="text-zinc-300 leading-normal" v-html="message"></p>

    <div class="flex flex-col gap-3 justify-end">
      <MyButton
        :label="confirmLabel || 'Confirm'"
        :severity="confirmSeverity || 'danger'"
        @click="close(true)"
      />

      <MyButton
        label="Cancel"
        severity="secondary"
        @click="close(false)"
        class="bg-zinc-700 font-bold"
      />
    </div>
  </div>
</template>
