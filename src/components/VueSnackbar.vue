<script setup lang="ts">
import { ref, watch } from "vue";

// <-- Variables -->
const props = defineProps({
  isVisible: { type: Boolean, required: true },
  text: { type: String, required: true },
});
const emit = defineEmits(["closeSnackbar"]);
const isVisible = ref(props.isVisible);

//<-- Watchers -->
watch(
  () => props.isVisible,
  (newValue) => {
    isVisible.value = newValue;
  },
  { deep: true }
);

// <-- Functions -->
const closeSnackbar = () => {
  emit("closeSnackbar");
};
</script>

<template>
  <div class="text-center flex justify-center items-center">
    <v-snackbar v-model="isVisible" color="secondary">
      {{ text }}
      <template v-slot:actions>
        <v-btn color="red-lighten-1" variant="contained" @click="closeSnackbar">
          <v-icon class="text-white">mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
