<script setup lang="ts">
defineProps(['modelValue', 'name'])
defineEmits(['update:modelValue'])
</script>

<template>
  <label :for="name" flex select-none items-center gap-2>
    <input :id="name" :checked="modelValue" type="checkbox" :name="name" hidden @input="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)">
    <span border="1 lime-400" inline-block h-4 w-4 flex items-center justify-center rounded-full :class="modelValue && 'bg-lime-400'">
      <div v-if="modelValue" i-ic-round-check text-black />
    </span>
    <slot />
  </label>
</template>
