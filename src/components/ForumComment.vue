<script setup lang="ts">
import DeletionDialog from "@/components/DeletionDialog.vue";
import { ref, computed, onMounted } from "vue";
import { useUsers } from "@/stores/users";
import { useComments } from "@/stores/comments";

// <-- Lifecycle hooks -->
onMounted(() => {
  handleNewPicture();
});

//<-- Stores -->
const usersStore = useUsers();
const commentsStore = useComments();

// <-- Variables -->

const props = defineProps({
  user: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true },
  id: { type: String, required: true },
  reference: { type: String, required: true },
  parentId: { type: String, required: true },
  createdBy: { type: String, required: true },
  photoUrl: { type: String },
  contentReference: { type: String },
});
const isDeletionDialogVisible = ref(false);

// <-- Computed -->
const isCreator = computed(
  () => usersStore.loggedInUser.uid === props.createdBy
);

const hasUserImage = computed(() =>
  props.photoUrl === "" ? "/assets/images/users/2.jpg" : props.photoUrl
);

const isAdmin = computed(() => usersStore.loggedInUser.role === "admin");

const canDeleteCharitiesComments = computed(
  () =>
    usersStore.loggedInUser.privileges["delete-comments-charities"] === true &&
    props.reference === "charities"
);

const canDeleteAdvertisementsComments = computed(
  () =>
    usersStore.loggedInUser.privileges["delete-comments-advertisements"] ===
      true && props.reference === "ads"
);

const canDeleteContentsComments = computed(
  () =>
    usersStore.loggedInUser.privileges["delete-comments-contents"] === true &&
    props.reference === "contents"
);

const emits = defineEmits(["deleteComment"]);
// <-- Functions -->
const handleDelete = (id: string, reference: string, parentId: string) => {
  emits("deleteComment", id, reference, parentId);
};

const handleAction = (emitValue: string) => {
  switch (emitValue) {
    case "delete":
      handleDelete(props.id, props.reference, props.parentId);
      break;
    default:
      isDeletionDialogVisible.value = false;
  }
};

const toggleDeletionDialog = () => {
  isDeletionDialogVisible.value = !isDeletionDialogVisible.value;
};

const handleNewPicture = () => {
  switch (isCreator.value) {
    case true:
      switch (true) {
        case props.photoUrl != usersStore.loggedInUser.photoURL:
          commentsStore.updateCommentImage(
            props.id,
            usersStore.loggedInUser.photoURL,
            props.reference,
            props.parentId,
            props.contentReference
          );
          break;
        default:
          return;
      }
      break;
    default:
      return;
  }
};
</script>
<template>
  <v-card class="mb-2 shadow-lg">
    <v-list>
      <v-list-item>
        <v-list-item-avatar class="mr-2">
          <v-avatar>
            <v-img :src="hasUserImage"></v-img>
          </v-avatar>
        </v-list-item-avatar>
        <div class="d-flex flex-column justify-start text-left">
          <v-list-item-title>
            <div class="d-flex justify-evenly">
              <h4 class="mr-2">{{ props.user }}</h4>
              <small>({{ props.date }})</small>
            </div>
          </v-list-item-title>
          <v-list-item-subtitle class="text-subtitle-1">
            {{ props.text }}
          </v-list-item-subtitle>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          v-if="
            isAdmin ||
            isCreator ||
            canDeleteCharitiesComments ||
            canDeleteAdvertisementsComments ||
            canDeleteContentsComments
          "
          color="error"
          variant="text"
          icon="mdi-delete"
          class="self-align-end"
          @click.stop="toggleDeletionDialog"
        >
        </v-btn>
        <DeletionDialog
          :is-visible="isDeletionDialogVisible"
          @handle-action="handleAction"
        ></DeletionDialog>
      </v-list-item>
    </v-list>
  </v-card>
</template>
