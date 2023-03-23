<script setup lang="ts">
import BaseBreadcrumb from "@/components/BaseBreadcrumb.vue";
import SelectField from "@/components/SelectField.vue";
import TextField from "@/components/TextField.vue";
import { useAdvertisements } from "@/stores/advertisements";
import { useUsers } from "@/stores/users";
import { computed, onMounted, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import type { Advertisement } from "./data/types";

//<-- Types -->
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

interface AdvertisementBeforeSubmit {
  createdBy: string;
  date: string | null;
  isFeatured: boolean;
  likes: number;
  file: string | null;
  longDescription: string | null;
  showInMenu: string | null;
  private: boolean;
  source: string | null;
  title: string | null;
  type: string | null;
  views: number;
}

// <-- Lifecycle Hooks -->
onMounted(() => {
  getUserPrivileges();
});

// <-- Stores -->
const advertisementsStore = useAdvertisements();
const usersStore = useUsers();

// <-- Variables -->
const page = ref({ title: "Add advertisement" });
const breadcrumbs = ref([
  { text: "Insert the advertisement information", disabled: false },
]);
const dialog = ref(false);
const router = useRouter();
const items = ["Image"];
const menuItems = ["Connecting", "Giving", "Home", "Inspiring"];
const advertisement: Ref<AdvertisementBeforeSubmit> = ref({
  createdBy: usersStore.loggedInUser.uid,
  date: null,
  isFeatured: false,
  likes: 0,
  file: "",
  longDescription: null,
  showInMenu: null,
  private: false,
  source: "",
  title: null,
  type: null,
  views: 0,
});
const advertisementStorage = ref({
  file: undefined,
});
const isLoaderShown = ref(false);
const hasPrivileges = ref(false);
const hasFormError = ref(false);
const formErrorText = ref("An error happened. Please, try again.");
const imageUrlPreview: Ref<string | ArrayBuffer | null> = ref("");
const imagePreviewDialog = ref(false);
const enableValidate = ref(false);

// <-- Computed -->
const isAdImage = computed(() => advertisement.value.type === "Image");

const isTypeSelected = computed(() => advertisement.value.type != "");

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
    : "Advertisement created successfully"
);

const isImageLoaded = computed(() => {
  return imageUrlPreview.value != "";
});

// <-- Functions -->
const handleDialog = () => {
  if (hasFormError.value) {
    return (dialog.value = false);
  }
  return returnHome();
};

const handleErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case "file/too-big":
      return "The file is too big. Please compress it or add a new one.";
    case "file/video-invalid":
      return "The video type should be mp4. Please, add the correct type.";
    case "file/image-invalid":
      return "The images can only be of type .jpeg or .png. Please, add the correct file.";
    case "form/empty-fields":
      return "Form cannot be empty. Please, fill the fields.";
    default:
      return "An error happened. Please, try again.";
  }
};

const handleFileForm = (file: File) => {
  const MAX_BYTES_SIZE = 1000000;
  const JPEG_TYPE = "image/jpeg";
  const PNG_TYPE = "image/png";
  const VIDEO_TYPE = "video/mp4";
  const fileType = advertisement.value.type;
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

const toggleDialog = () => {
  dialog.value = !dialog.value;
};

const toggleFormError = () => {
  hasFormError.value = !hasFormError.value;
};

const addErrorText = (string = "An error has occurred, please try again") => {
  formErrorText.value = string;
};

const validateForm = () => {
  return Object.values(advertisement.value).includes(null);
};

const addAdvertisement = async () => {
  if (hasFormError.value) {
    toggleFormError();
  }
  isLoaderShown.value = true;
  if (validateForm()) {
    showError("form/empty-fields");
    isLoaderShown.value = false;
    enableValidate.value = true;
    return;
  }
  const newAdvertisement = JSON.parse(JSON.stringify(advertisement.value));
  try {
    const result = await advertisementsStore.addAdvertisement(
      newAdvertisement,
      advertisementStorage.value
    );
    if (!result) {
      return;
    }
    resetForm();
    dialog.value = true;
    isLoaderShown.value = false;
  } catch (error) {
    isLoaderShown.value = false;
    console.error(error);
  }
};
const returnHome = () => {
  dialog.value = false;
  router.push("/menu/advertisements");
};

const resetForm = () => {
  const advertisementKeys = Object.keys(advertisement.value);
  advertisementKeys.forEach((key) => {
    // @ts-expect-error: Expect keyof error
    advertisement.value[key as keyof Advertisement] = "";
  });
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

const uploadFile = (event: any) => {
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
  const canCreateAdvertisements =
    usersStore.loggedInUser.privileges["add-advertisements"];
  if (canCreateAdvertisements) {
    togglePrivilegeLoader();
    return;
  } else {
    router.push("/");
  }
};

const togglePrivilegeLoader = () => {
  hasPrivileges.value = !hasPrivileges.value;
};

const showImagePreview = () => {
  imagePreviewDialog.value = true;
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
    <div class="pa-5">
      <v-form>
        <v-container>
          <v-row>
            <v-col cols="12" sm="6" lg="4">
              <SelectField
                label="Select content type"
                :items="items"
                v-model="advertisement.type"
                :error-messages="enableValidate && !advertisement.type ? 'Field is required' : ''"
              ></SelectField>
            </v-col>
            <v-col cols="12" sm="6" lg="4">
              <v-file-input
                :disabled="!isTypeSelected"
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
              <TextField
                label="Title"
                v-model="advertisement.title"
                :error-messages="enableValidate && !advertisement.title ? 'Field is required' : ''"
              ></TextField>
            </v-col>
            <v-col cols="12" sm="6" lg="4">
              <SelectField
                label="Select menu"
                :items="menuItems"
                v-model="advertisement.showInMenu"
                :error-messages="enableValidate && !advertisement.showInMenu ? 'Field is required' : ''"
              >
              </SelectField>
            </v-col>            
            <v-col cols="12" sm="6" lg="4">
              <TextField
                label="Date"
                type="date"
                v-model="advertisement.date"
                :error-messages="enableValidate && !advertisement.date ? 'Field is required' : ''"
              ></TextField>
            </v-col>
            <v-col cols="12">
              <v-textarea
                hide-details="auto"
                color="secondary"
                outlined
                name="input-7-4"
                v-model="advertisement.longDescription"
                :label="advertisement.longDescription ? advertisement.longDescription.length + '/100' : 'Description (Max. 100)'"
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
    <v-btn
      block
      color="secondary"
      size="large"
      class="text-none"
      @click.stop="addAdvertisement"
    >
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
      <span v-else>Create advertisement</span>
    </v-btn>
  </v-card>
</template>
