<script setup lang="ts">
import { ref, computed } from "vue";
import { sortDate } from "@/views/menu/functions";
import { useUsers } from "@/stores/users";
import ForumDialog from "../../../../components/ForumDialog.vue";
import DeletionDialog from "@/components/DeletionDialog.vue";

// <-- Stores -->
const usersStore = useUsers();

// <-- Variables -->
const props = defineProps({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  category: { type: String, required: true },
  startDate: { type: String, required: true },
  likes: { type: Number, required: true },
  views: { type: Number, required: true },
  isFeatured: { type: Boolean, required: true },
  isVerified: { type: Boolean, required: true },
  id: { type: String, required: true },
  createdBy: { type: String, required: true },
  displayPicture: { type: String },
  coverPicture: { type: String },
  documents: { type: String },
});
const isVerified = ref(props.isVerified);
const isDialogVisible = ref(false);
const isDeletionDialogVisible = ref(false);
const emit = defineEmits([
  "handleModify",
  "handleDelete",
  "handleFeatured",
  "handleVerify",
]);
const firebaseCommentReference = "charities";

// <-- Computed -->
const canFeatureCharities = computed(
  () => usersStore.loggedInUser.role === "admin"
);

const isOwner = computed(() => usersStore.loggedInUser.uid === props.createdBy);

const canVerifyCharities = computed(
  () => usersStore.loggedInUser.privileges["verify-charities"]
);

const canCommentOnCharities = computed(
  () => usersStore.loggedInUser.privileges["comment-charities"]
);

const canDeleteCharities = computed(
  () => usersStore.loggedInUser.privileges["delete-charities"]
);
const canModifyCharities = computed(
  () => usersStore.loggedInUser.privileges["modify-charities"]
);
const charityImage = computed(() =>
  props.displayPicture === ""
    ? "/assets/images/charity/charity-hands.jpg"
    : props.displayPicture
);

// <-- Functions -->
const handleModify = (id: string) => {
  emit("handleModify", id);
};
const handleDelete = (
  id: string,
  displayPicture: string,
  coverPicture: string,
  documents: string
) => {
  emit("handleDelete", id, displayPicture, coverPicture, documents);
};
const handleFeatured = (id: string) => {
  emit("handleFeatured", id);
};
const handleVerify = (id: string) => {
  emit("handleVerify", id);
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
      handleDelete(
        props.id,
        props.displayPicture as string,
        props.coverPicture as string,
        props.documents as string
      );
      toggleDeletionDialog();
      break;
    default:
      toggleDeletionDialog();
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
          :src="charityImage"
          width="100px"
          height="100px"
          class="img-fluid"
          :cover="true"
        ></v-img>
      </div>
      <div class="ml-5">
        <h4>{{ props.title }}</h4>
        <small>{{ props.shortDescription }}</small>
      </div>
    </div>
  </td>
  <td>{{ props.category }}</td>
  <td>{{ sortDate(props.startDate) }}</td>
  <td v-if="canVerifyCharities">
    <div>
      <v-checkbox
        @click.stop="handleVerify(props.id)"
        v-model="isVerified"
        color="success"
        hide-details
      ></v-checkbox>
    </div>
  </td>
  <td>
    <v-chip color="atmabest">
      <v-icon small class="mr-1">mdi-heart</v-icon>
      <span>{{ props.likes }}</span>
    </v-chip>
  </td>
  <td>
    <v-chip color="secondary">
      <v-icon small class="mr-1">mdi-eye</v-icon>
      <span>{{ props.views }}</span>
    </v-chip>
  </td>
  <td>
    <v-row no-gutters class="mt-lg-2" style="min-width:120px">
      <v-col cols="12" sm="12" lg="3" v-if="canFeatureCharities">
        <v-btn color="transparent" variant="plain" min-width="0" class="pa-1">
          <v-icon
            @click.stop="handleFeatured(props.id)"
            v-if="!props.isFeatured"
            size="large"
            class="text-warning cursor-pointer"
            title="Add to featured"
            >mdi-star</v-icon
          >
          <v-icon
            @click.stop="handleFeatured(props.id)"
            v-if="props.isFeatured"
            size="large"
            class="text-warning cursor-pointer"
            title="Add to featured"
            >mdi-star-off</v-icon
          >
        </v-btn>
      </v-col>
      <!--      
      <v-col cols="12" sm="12" lg="3" v-if="canCommentOnCharities">
        <v-btn
          color="transparent"
          variant="plain"
          min-width="0"
          class="pa-1 mr-5"
        >
          <v-icon
            size="large"
            class="text-success cursor-pointer"
            title="Write a message"
            @click.stop="showComments"
          >
            mdi-forum
          </v-icon>
          <ForumDialog
            v-if="isDialogVisible"
            :id="props.id"
            :reference="firebaseCommentReference"
            :title="props.title"
            @handle-dialog="closeDialog"
            v-model="isDialogVisible"
          />
        </v-btn>
      </v-col>
      -->
      <v-col cols="12" sm="12" lg="3" v-if="canModifyCharities || isOwner">
        <v-btn color="transparent" variant="plain" min-width="0" class="pa-1">
          <v-icon
            size="large"
            class="text-info cursor-pointer"
            title="Edit"
            @click.stop="handleModify(props.id)"
          >
            mdi-pencil
          </v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12" sm="12" lg="3" v-if="canDeleteCharities">
        <v-btn color="transparent" variant="plain" min-width="0" class="pa-1">
          <v-icon
            size="large"
            class="text-error cursor-pointer"
            title="Delete"
            @click.stop="toggleDeletionDialog"
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
