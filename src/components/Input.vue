<script setup lang="ts">
defineProps(['modelValue', 'name', 'type', 'disabled'])
defineEmits(['update:modelValue'])
</script>

<template>
  <div flex flex-col gap-1>
    <label :for="name" pl-1 text-lime-400>
      <slot />
    </label>
    <input
      :id="name"
      :value="modelValue"
      :type="type || 'text'"
      :disabled="disabled"
      border="1 lime-400" rounded-full bg="transparent disabled:slate-100/10" p="x-4 y-1" ring="hover:lime-400 focus:2" outline-none
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>
