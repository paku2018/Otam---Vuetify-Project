<template>
  <v-select
    :items="props.items"
    :label="props.label"
    variant="outlined"
    hide-details="auto"
    color="secondary"
    v-model="currentValue"
    :disabled="props.disabled"
  >
  </v-select>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { PropType } from "vue";
// <-- Variables -->
const props = defineProps({
  label: { type: String, required: true },
  items: { type: Array as PropType<string[]>, required: true },
  disabled: { type: Boolean },
});
const currentValue = ref("");
</script>
