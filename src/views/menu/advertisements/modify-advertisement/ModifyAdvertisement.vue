<script setup lang="ts">
import { ref, onBeforeMount, computed } from "vue";
import type { Ref } from "vue";
import { useAdvertisements } from "@/stores/advertisements";
import { useUsers } from "@/stores/users";
import { useRouter, useRoute } from "vue-router";
import BaseBreadcrumb from "@/components/BaseBreadcrumb.vue";
import SelectField from "@/components/SelectField.vue";
import TextField from "@/components/TextField.vue";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

//<-- Types -->
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

interface StorageAd {
  file: undefined | File;
}

// <-- Lifecycle Hooks -->
onBeforeMount(async () => {
  await getAdToModify();
  getUserPrivileges();
  isAdvertisementToModify.value = true;
});

// <-- Stores -->
const advertisementsStore = useAdvertisements();
const usersStore = useUsers();

// <-- Variables -->
const page = ref({ title: "Modify advertisement" });
const breadcrumbs = ref([
  { text: "Edit advertisement details", disabled: false },
]);
const items = ["Image"];
const menuItems = ["Connecting", "Giving", "Home", "Inspiring"];
const dialog = ref(false);
const route = useRoute();
const router = useRouter();
const isAdvertisementToModify = ref(false);
const adToModify = ref();
const isLoaderShown = ref(false);
const advertisementStorage: Ref<StorageAd> = ref({
  file: undefined,
});
const hasPrivileges = ref(false);
const hasFormError = ref(false);
const formErrorText = ref("An error has occurred. Please, try again");
const imageUrlPreview: Ref<string | ArrayBuffer | null> = ref("");
const imagePreviewDialog = ref(false);

//<-- Computed -->

const isImageLoaded = computed(() => {
  return imageUrlPreview.value != "";
});

const isAdImage = computed(() => adToModify.value.type === "Image");

const dialogIcon = computed((): string => {
  return hasFormError.value ? "mdi-alert" : "mdi-home";
});

const dialogButtonText = computed((): string => {
  return hasFormError.value ? "Fix error" : "Return";
});

const buttonDialogColor = computed((): string => {
  return hasFormError.value ? "error" : "secondary";
});

const dialogText = computed(() =>
  hasFormError.value
    ? `${formErrorText.value}`
    : "Advertisement modified successfully"
);

const isOwner = computed(
  () => adToModify.value.createdBy === usersStore.loggedInUser.uid
);

// <-- Functions -->
const showImagePreview = () => {
  imagePreviewDialog.value = true;
};

const returnHome = () => {
  dialog.value = false;
  router.push("/menu/advertisements");
};

const handleDialog = () => {
  if (hasFormError.value) {
    return (dialog.value = false);
  }
  return returnHome();
};

const getAdToModify = async () => {
  const docSnap = await getDoc(doc(db, "ads", `${route.params.id}`));
  adToModify.value = {
    createdBy: docSnap?.data()?.createdBy,
    date: docSnap?.data()?.date,
    longDescription: docSnap?.data()?.longDescription,
    showInMenu: docSnap?.data()?.showInMenu,
    source: docSnap?.data()?.source,
    title: docSnap?.data()?.title,
    type: docSnap?.data()?.type,
    id: docSnap.id,
  };
};

const modifyAdvertisement = async () => {
  isLoaderShown.value = true;
  const modifiedAd = JSON.parse(JSON.stringify(adToModify.value));
  try {
    const updateResult = await advertisementsStore.updateAdvertisementDetails(
      route.params.id as string,
      modifiedAd
    );
    const storageResult = await advertisementsStore.addAdvertisementStorageData(
      advertisementStorage.value,
      route.params.id as string
    );
    if (updateResult && storageResult) {
      isLoaderShown.value = false;
      dialog.value = true;
    }
  } catch (e) {
    console.error(e);
    isLoaderShown.value = false;
  }
};

const createFilePreview = (file: File) => {
  if (file === undefined) {
    return;
  }
  imageUrlPreview.value = "";
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target === null) {
      return;
    }
    imageUrlPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const uploadFile = (event: HTMLInputEvent) => {
  if (hasFormError.value) {
    toggleFormError();
  }
  if (!event.target.files) {
    return;
  }
  const hasFileError = handleFileForm(event.target.files[0]);
  if (hasFileError) {
    return;
  }
  createFilePreview(event.target.files[0]);
  advertisementStorage.value.file = event.target.files[0];
};

const handleFileForm = (file: File) => {
  const MAX_BYTES_SIZE = 1000000;
  const JPEG_TYPE = "image/jpeg";
  const PNG_TYPE = "image/png";
  const VIDEO_TYPE = "video/mp4";
  const fileType = adToModify.value.type;
  if (file.size >= MAX_BYTES_SIZE) {
    showError("file/too-big");
    return true;
  }

  if (fileType === "Image") {
    if (file.type != JPEG_TYPE && file.type != PNG_TYPE) {
      showError("file/image-invalid");
      return true;
    }
  } else {
    if (file.type != VIDEO_TYPE) {
      showError("file/video-invalid");
      return true;
    }
  }
};

const showError = (errorCode: string) => {
  toggleFormError();
  addErrorText(handleErrorMessage(errorCode));
  toggleDialog();
};

const handleErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case "file/too-big":
      return "The file is too big. Please compress it or add a new one.";
    case "file/video-invalid":
      return "The video type should be mp4. Please, add the correct type.";
    case "file/image-invalid":
      return "The images can only be of type .jpeg or .png. Please, add the correct file.";
    default:
      return "An error happened. Please, try again.";
  }
};

const toggleDialog = () => {
  dialog.value = !dialog.value;
};

const addErrorText = (string = "An error has occurred, please try again") => {
  formErrorText.value = string;
};

const toggleFormError = () => {
  hasFormError.value = !hasFormError.value;
};

const getUserPrivileges = () => {
  const userRole = usersStore.loggedInUser.role;
  if (userRole === "") {
    setTimeout(() => {
      getUserPrivileges();
    }, 200);
  } else {
    handlePrivileges();
  }
};

const handlePrivileges = () => {
  const canModifyAdvertisements =
    usersStore.loggedInUser.privileges["modify-advertisements"];
  if (canModifyAdvertisements || isOwner.value) {
    togglePrivilegeLoader();
    return;
  } else {
    router.push("/");
  }
};

const togglePrivilegeLoader = () => {
  hasPrivileges.value = !hasPrivileges.value;
};
</script>

<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-card v-if="!hasPrivileges" class="d-flex align-center justify-center">
    <tbody>
      <tr>
        <td colspan="6" class="pa-5 text-center">
          <v-progress-circular
            indeterminate
            color="secondary"
          ></v-progress-circular>
        </td>
      </tr>
    </tbody>
  </v-card>
  <v-card v-else>
    <v-toolbar color="transparent">
      <v-toolbar-title class="font-weight-medium">Details</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-divider></v-divider>
    <template v-if="!isAdvertisementToModify">
      <div class="pa-5 text-center">
        <v-progress-circular
          indeterminate
          color="secondary"
        ></v-progress-circular>
      </div>
    </template>
    <template v-if="isAdvertisementToModify">
      <div class="pa-5">
        <v-form>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" lg="4">
                <SelectField
                  label="Select content type"
                  :items="items"
                  v-model="adToModify.type"
                  :error-messages="adToModify.type ? '' : 'Field is required'"
                ></SelectField>
              </v-col>
              <v-col cols="12" sm="6" lg="4">
                <v-file-input
                  label="Select file"
                  variant="outlined"
                  color="secondary"
                  hide-details
                  preprend-icon="mdi-upload"
                  @change="(e: HTMLInputEvent) => uploadFile(e)"
                >
                </v-file-input>
              </v-col>
              <v-col cols="12" sm="6" lg="4">
                <TextField label="Title" v-model="adToModify.title" 
                  :error-messages="adToModify.title ? '' : 'Field is required'"
                ></TextField>
              </v-col>
              <v-col cols="12" sm="6" lg="4">
                <SelectField
                  label="Select menu"
                  :items="menuItems"
                  v-model="adToModify.showInMenu"
                  :error-messages="adToModify.showInMenu ? '' : 'Field is required'"
                >
                </SelectField>
              </v-col>              
              <v-col cols="12" sm="6" lg="4">
                <TextField
                  label="Date"
                  type="date"
                  v-model="adToModify.date"
                  :error-messages="adToModify.date ? '' : 'Field is required'"
                ></TextField>
              </v-col>
              <v-col cols="12" xs="12" sm="12" lg="12">
                <v-textarea
                  hide-details="auto"
                  color="secondary"
                  outlined
                  name="input-7-4"
                  v-model="adToModify.longDescription"
                  :label="adToModify.longDescription ? adToModify.longDescription.length + '/100' : 'Description (Max. 100)'"
                  :maxlength="100"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </div>
      <template v-if="isImageLoaded && isAdImage">
        <v-toolbar color="transparent">
          <v-toolbar-title class="font-weight-medium"
            >Image preview</v-toolbar-title
          >
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-divider></v-divider>
        <div class="pa-5 mb-5">
          <v-row>
            <v-col cols="12" class="d-flex justify-center align-center">
              <div class="w-auto h-auto">
                <v-img
                  class="mt-2 img-fluid"
                  :src="(imageUrlPreview as string | undefined) "
                  height="100"
                  width="100"
                  :cover="true"
                />
              </div>

              <v-btn
                @click="showImagePreview"
                large
                color="secondary"
                class="ml-2"
                >Show full image
                <v-dialog v-model="imagePreviewDialog" fullscreen>
                  <v-card>
                    <v-toolbar dark color="secondary">
                      <v-btn icon dark @click="imagePreviewDialog = false">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                      <v-toolbar-title>Preview</v-toolbar-title>
                      <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-text
                      class="d-flex justify-center align-center"
                      max-width="auto"
                      max-height="auto"
                    >
                      <div class="w-auto h-auto">
                        <v-img
                          :src="(imageUrlPreview as string | undefined)"
                          width="auto"
                          height="auto"
                          contain
                          class="img-fluid"
                        />
                      </div>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </template>
      <v-divider></v-divider>
      <v-btn block color="secondary" size="large" @click="modifyAdvertisement">
        <v-dialog v-model="dialog" class="pa-2" persistent>
          <v-card>
            <v-card-text class="text-center">{{ dialogText }}</v-card-text>
            <v-card-actions>
              <v-btn
                :color="buttonDialogColor"
                variant="outlined"
                block
                @click.stop="handleDialog"
                ><v-icon>{{ dialogIcon }}</v-icon
                >{{ dialogButtonText }}</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-progress-circular
          v-if="isLoaderShown"
          indeterminate
          color="white"
        ></v-progress-circular>
        <span class="text-none" v-else>Modify advertisement</span>
      </v-btn>
    </template>
  </v-card>
</template>
