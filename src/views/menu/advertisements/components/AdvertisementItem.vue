<script setup lang="ts">
import { ref, computed } from "vue";
import { useUsers } from "@/stores/users";
import { sortDate } from "@/views/menu/functions";
import ForumDialog from "../../../../components/ForumDialog.vue";
import DeletionDialog from "@/components/DeletionDialog.vue";

// <-- Stores -->
const usersStore = useUsers();

// <-- Variables -->
const props = defineProps({
  createdBy: { type: String, required: true },
  date: { type: String, required: true },
  id: { type: String, required: true },
  isFeatured: { type: Boolean, required: true },
  likes: { type: Number, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  views: { type: Number, required: true },
  file: { type: String },
});
const isDialogVisible = ref(false);
const emit = defineEmits(["handleModify", "handleDelete", "handleFeatured"]);
const isDeletionDialogVisible = ref(false);
const firebaseCommentReference = "ads";

// <-- Computed -->
const isOwner = computed(() => usersStore.loggedInUser.uid === props.createdBy);

const canFeatureAdvertisements = computed(
  () => usersStore.loggedInUser.role === "admin"
);

const canCommentOnAdvertisements = computed(
  () => usersStore.loggedInUser.privileges["comment-advertisements"]
);

const canDeleteAdvertisements = computed(
  () => usersStore.loggedInUser.privileges["delete-advertisements"]
);

const canModifyAdvertisements = computed(
  () => usersStore.loggedInUser.privileges["modify-advertisements"]
);

const advertisementImage = computed(() =>
  props.file === ""
    ? "/assets/images/advertisements/advertisements.jpg"
    : props.file
);

// <-- Functions -->
const handleModify = (id: string) => {
  emit("handleModify", id);
};
const handleDelete = (id: string, file: string) => {
  emit("handleDelete", id, file);
};
const handleFeatured = (id: string) => {
  emit("handleFeatured", id);
};

const showComments = () => {
  isDialogVisible.value = !isDialogVisible.value;
};
const closeDialog = () => {
  isDialogVisible.value = !isDialogVisible.value;
};

const handleAction = (emitValue: string) => {
  switch (emitValue) {
    case "delete":
      handleDelete(props.id, props.file as string);
      break;
    default:
      isDeletionDialogVisible.value = false;
  }
};

const toggleDeletionDialog = () => {
  isDeletionDialogVisible.value = !isDeletionDialogVisible.value;
};
</script>

<template>
  <td>
    <div class="d-flex align-center py-4">
      <div class="w-auto h-auto">
        <v-img
          :src="advertisementImage"
          width="100px"
          height="100px"
          :cover="true"
          class="img-fluid"
        ></v-img>
      </div>
      <div class="ml-5">
        <h4>{{ props.title }}</h4>
      </div>
    </div>
  </td>
  <td>{{ props.type }}</td>
  <td>{{ sortDate(props.date) }}</td>
  <td>
    <v-row no-gutters class="mt-lg-2">      
      <v-col cols="12" sm="12" lg="3" v-if="canModifyAdvertisements || isOwner">
        <v-btn
          color="transparent"
          variant="plain"
          min-width="0"
          class="pa-1"
          @click.stop="handleModify(props.id)"
        >
          <v-icon size="x-large" class="text-info cursor-pointer" title="Edit">
            mdi-pencil
          </v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12" sm="12" lg="3" v-if="canDeleteAdvertisements">
        <v-btn color="transparent" variant="plain" min-width="0" class="pa-1">
          <v-icon
            @click.stop="toggleDeletionDialog"
            size="x-large"
            class="text-error cursor-pointer"
            title="Delete"
            >mdi-delete</v-icon
          >
          <DeletionDialog
            :is-visible="isDeletionDialogVisible"
            @handle-action="handleAction"
          ></DeletionDialog>
        </v-btn>
      </v-col>
    </v-row>
  </td>
</template>
