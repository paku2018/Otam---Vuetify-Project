<template>
  <v-text-field
    hide-details="auto"
    color="secondary"
    :label="props.label"
    variant="outlined"
    v-model="currentValue"
    :maxLength="props.maxLength"
    :type="props.type"
  ></v-text-field>
</template>

<script setup lang="ts">
import { ref } from "vue";
// <-- Variables -->
const props = defineProps({
  label: { type: String, required: true },
  maxLength: { type: String, default: null },
  type: { type: String, default: null },
});
const currentValue = ref("");
</script>
