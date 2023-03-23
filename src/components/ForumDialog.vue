<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { Ref } from "vue";
import TextField from "./TextField.vue";
import { useComments } from "@/stores/comments";
import { useUsers } from "@/stores/users";
import ForumComment from "./ForumComment.vue";
import type { FieldValue } from "firebase/firestore";
import { useDisplay } from "vuetify";

interface Comment {
  date: string;
  text: string;
  user: string;
  timestamp: FieldValue | undefined;
  id?: string;
  createdBy: string;
  photoUrl: string;
}

// <-- Lifecycle hooks -->
onMounted(async () => {
  initializeForum();
});

// <-- Stores -->
const commentsStore = useComments();
const usersStore = useUsers();

// <-- Variables -->
const props = defineProps({
  reference: { type: String, required: true },
  id: { type: String, required: true },
  contentReference: { type: String, required: false },
  title: { type: String, required: true },
});
const emits = defineEmits(["handleDialog"]);
const text = ref("");
const comments: Ref<Comment[]> = ref([]);
const isLoaderShown = ref(false);
const isCommentBeingSent = ref(false);

const cardTextHeight = computed(() => {
  if (screenSize.value) {
    return "height: calc(100vh - 135px)";
  } else {
    return "height: 35.5rem";
  }
});

// <-- Computed properties -->
const iconColor = computed(() => {
  return isCommentBeingSent.value || isLoaderShown.value ? "grey" : "secondary";
});

const screenSize = computed(() => {
  const { smAndDown } = useDisplay();
  return smAndDown.value;
});

const cardSize = computed(() => {
  return screenSize.value ? undefined : "700";
});

const dialogHeight = computed(() => {
  return screenSize.value ? undefined : "400";
});

// <-- Functions -->
const formatDate = (date: string[]) => {
  date.shift();
  date.splice(0, 1, formatMonth(date[0]));
  date.splice(2, 0, "of");
  date.splice(4, 0, "at");
  const formatedDate = date.join(" ");
  return formatedDate;
};

const formatMonth = (month: string): string => {
  switch (month) {
    case "Jan":
      return "January";
    case "Feb":
      return "February";
    case "Mar":
      return "March";
    case "Apr":
      return "April";
    case "May":
      return "May";
    case "Jun":
      return "June";
    case "Jul":
      return "July";
    case "Aug":
      return "August";
    case "Sep":
      return "September";
    case "Oct":
      return "October";
    case "Nov":
      return "November";
    case "Dec":
      return "December";
    default:
      return "Month";
  }
};

const handleClosing = () => {
  emits("handleDialog");
};

const submitComment = async () => {
  isLoaderShown.value = true;
  isCommentBeingSent.value = true;
  const date = new Date().toString().split("GMT")[0].trim().split(" ");
  const comment = {
    createdBy: usersStore.loggedInUser.uid,
    date: formatDate(date),
    text: text.value,
    timestamp: undefined,
    user: usersStore.loggedInUser.displayName,
    photoUrl: usersStore.loggedInUser.photoURL,
  };
  try {
    if (props.reference === "contents") {
      await commentsStore.addContentComment(
        comment,
        props.id,
        props.contentReference as string
      );
      await initializeContentComments(
        props.id,
        props.contentReference as string
      );
    } else {
      await commentsStore.addComment(comment, props.reference, props.id);
      await initializeComments(props.reference, props.id);
    }
    text.value = "";
    isLoaderShown.value = false;
    isCommentBeingSent.value = false;
  } catch (error) {
    console.error(error);
    isLoaderShown.value = false;
    isCommentBeingSent.value = false;
  }
};

const handleDeletion = async (
  id: string,
  reference: string,
  parentId: string
) => {
  isLoaderShown.value = true;
  try {
    if (props.reference === "contents") {
      await commentsStore.deleteContentComment(
        props.id,
        id,
        props.contentReference as string
      );
      await initializeContentComments(
        props.id,
        props.contentReference as string
      );
    } else {
      await commentsStore.deleteComment(id, reference, parentId);
      await initializeComments(props.reference, props.id);
    }
    isLoaderShown.value = false;
  } catch (error) {
    console.error(error);
    isLoaderShown.value = false;
  }
};

const initializeComments = async (reference: string, id: string) => {
  comments.value = await commentsStore.getComments(reference as string, id);
};

const initializeContentComments = async (id: string, category: string) => {
  comments.value = await commentsStore.getContentComments(
    id,
    category as string
  );
};

const toggleLoader = () => {
  isLoaderShown.value = !isLoaderShown.value;
};

const initializeForum = async () => {
  toggleLoader();
  if (props.reference === "contents") {
    await initializeContentComments(props.id, props.contentReference as string);
    toggleLoader();
    return;
  } else {
    await initializeComments(props.reference, props.id);
    toggleLoader();
    return;
  }
};
</script>

<template>
  <v-dialog
    activator
    class="pa-2 dialog"
    persistent
    :fullscreen="screenSize"
    :height="dialogHeight"
    :retain-focus="false"
  >
    <v-card :width="cardSize" :height="cardSize">
      <v-card-title class="d-flex justify-space-between w-full">
        <h3>{{ props.title }}</h3>
        <button @click="handleClosing">
          <v-icon>mdi-close</v-icon>
        </button>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="text-center overflow-auto" :style="cardTextHeight">
        <template v-if="isLoaderShown">
          <v-progress-circular
            indeterminate
            color="secondary"
          ></v-progress-circular>
        </template>
        <template v-else>
          <template v-if="!comments.length">
            <div>No comments created</div>
          </template>
          <template v-else>
            <template v-for="comment in comments" :key="comment.id">
              <ForumComment
                :content-reference="props.contentReference"
                :createdBy="comment.createdBy"
                :date="comment.date"
                :id="comment.id!"
                :parentId="props.id"
                :photo-url="comment.photoUrl"
                :reference="props.reference"
                :text="comment.text"
                :user="comment.user"
                @delete-comment="handleDeletion"
              />
            </template>
          </template>
        </template>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-row>
          <v-col cols="10" sm="11">
            <TextField
              :disabled="isCommentBeingSent || isLoaderShown"
              v-model="text"
              label="Write your comment here"
              @keyup.enter="submitComment"
            ></TextField>
          </v-col>
          <v-col cols="2" sm="1" class="d-flex justify-center items-center">
            <button
              @click="submitComment"
              :disabled="isCommentBeingSent || isLoaderShown"
            >
              <v-icon :color="iconColor" size="large">mdi-send</v-icon>
            </button>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
