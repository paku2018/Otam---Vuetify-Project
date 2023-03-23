<script setup lang="ts">
import { ref, watch } from "vue";

// <-- Variables -->
const props = defineProps({
  isVisible: { type: Boolean, required: true },
});
const emit = defineEmits(["handleAction"]);
const isVisible = ref(props.isVisible);

//<-- Watchers -->
watch(
  () => props.isVisible,
  (newValue) => {
    isVisible.value = newValue;
  },
  {
    deep: true,
  }
);

// <-- Functions -->
const handleAction = (action: string) => {
  return emit("handleAction", action);
};
</script>

<template>
  <v-dialog v-model="isVisible" class="pa-2">
    <v-card>
      <v-card-text class="text-center"
        ><span>Are you sure you want to delete this item?</span>
        <br />
        <span>This action is irreversible.</span>
      </v-card-text>
      <v-card-actions class="d-flex flex-column">
        <v-btn
          class="mb-3 text-none"
          color="secondary"
          variant="outlined"
          block
          @click="handleAction('return')"
          ><v-icon>mdi-home</v-icon>Go back</v-btn
        >
        <v-btn
          class="ma-0 text-none"
          color="error"
          variant="contained"
          block
          @click="handleAction('delete')"
          ><v-icon>mdi-delete</v-icon>Confirm deletion</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
