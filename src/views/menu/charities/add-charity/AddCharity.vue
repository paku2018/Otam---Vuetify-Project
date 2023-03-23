<script setup lang="ts">
import { status } from "./data/data";
import { ref, computed, onMounted, type Ref } from "vue";
import { sortCountries } from "./data/functions";
import { useCharities } from "@/stores/charities";
import { useConnections } from "@/stores/connections";
import { useRouter } from "vue-router";
import { useUsers } from "@/stores/users";
import BaseBreadcrumb from "@/components/BaseBreadcrumb.vue";
import SelectField from "@/components/SelectField.vue";
import TextField from "@/components/TextField.vue";
import type { Charity } from "./data/types";

// <-- Types -->
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

interface CharityBeforeSubmit {
  accountsDate: string | null;
  address: string | null;
  beneficiary: string | null;
  category: string | null;
  charityNumber: string | null;
  charityURL: string | null;
  collectedDonation: string | null;
  contactEmail: string | null;
  contactName: string | null;
  contactNumber: string | null;
  country: string | null;
  coverPicture: string;
  createdBy: string;
  displayPicture: string;
  documents: string;
  facebook: string | null;
  feed: string | null;
  instagram: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  lastChecked: string | null;
  likes: number;
  longDescription: string | null;
  operation: string | null;
  private: boolean;
  registrationDate: string | null;
  removeDate: string | null;
  shortDescription: string | null;
  startDate: string | null;
  status: string | null;
  subtitle: string | null;
  title: string | null;
  totalIncome: string | null;
  totalSpent: string | null;
  twitter: string | null;
  URL: string | null;
  user: string | null;
  views: number;
  website: string | null;
  youtube: string | null;
}

// <-- Lifecycle Hooks -->
onMounted(async () => {
  getUserPrivileges();
  initializeUsers();
  beneficiaries.value = await initializeConnections("beneficiaries");
  operations.value = await initializeConnections("operations");
  categories.value = await initializeConnections("categories");
  const countryList = await sortCountries();
  sortedCountries.value = countryList;
});
// <-- Stores -->
const charities = useCharities();
const usersStore = useUsers();
const connectionsStore = useConnections();

// <-- Variables -->
const charityDetails: Ref<CharityBeforeSubmit> = ref({
  accountsDate: null,
  address: null,
  beneficiary: null,
  category: null,
  charityNumber: null,
  charityURL: null,
  collectedDonation: null,
  contactEmail: null,
  contactName: null,
  contactNumber: null,
  country: null,
  coverPicture: "",
  createdBy: usersStore.loggedInUser.uid,
  displayPicture: "",
  documents: "",
  facebook: null,
  feed: null,
  instagram: null,
  isFeatured: false,
  isVerified: false,
  lastChecked: null,
  likes: 0,
  longDescription: null,
  operation: null,
  private: false,
  registrationDate: null,
  removeDate: null,
  shortDescription: null,
  startDate: null,
  status: null,
  subtitle: null,
  title: null,
  totalIncome: null,
  totalSpent: null,
  twitter: null,
  URL: null,
  user: null,
  views: 0,
  website: null,
  youtube: null,
});

const charityStorageData = ref({
  displayPicture: undefined,
  coverPicture: undefined,
  documents: undefined,
});
const page = ref({ title: "Add charity" });
const breadcrumbs = ref([
  { text: "Insert the charity information", disabled: false },
]);
const sortedCountries: Ref<string[]> = ref([]);
const dialog = ref(false);
const router = useRouter();
const isLoaderShown = ref(false);
const hasPrivileges = ref(false);
const hasFormError = ref(false);
const formErrorText = ref("An error happened. Please, try again.");
const categories: Ref<string[] | []> = ref([]);
const operations: Ref<string[] | []> = ref([]);
const beneficiaries: Ref<string[] | []> = ref([]);
const displayPictureUrlPreview: Ref<string | ArrayBuffer | null> = ref("");
const coverPictureUrlPreview: Ref<string | ArrayBuffer | null> = ref("");
const displayPictureDialog = ref(false);
const coverPictureDialog = ref(false);
const enableValidate = ref(false);

// <-- Computed Properties -->
const isDisplayPictureLoaded = computed(
  () => displayPictureUrlPreview.value != ""
);

const isCoverPictureLoaded = computed(() => coverPictureUrlPreview.value != "");

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
  hasFormError.value ? `${formErrorText.value}` : "Charity created successfully"
);

const sortedStatus = computed(() => {
  return status.sort();
});

const users = computed(() => {
  return usersStore.users.map((user) => user.displayName);
});

const isImageLoaded = computed(
  () => isDisplayPictureLoaded.value || isCoverPictureLoaded.value
);

// <-- Functions -->

const showDisplayPictureDialog = () => {
  displayPictureDialog.value = true;
};
const showCoverPictureDialog = () => {
  coverPictureDialog.value = true;
};

const validateForm = () => {
  return Object.values(charityDetails.value).includes(null);
};

const createCharity = async () => {
  if (hasFormError.value) {
    toggleFormError();
  }
  if(usersStore.loggedInUser.role != 'admin') {
    charityDetails.value.user = ""
    charityDetails.value.status = "Enabled"
  }
  isLoaderShown.value = true;
  if (validateForm()) {
    toggleFormError();
    addErrorText(handleErrorMessage("form/empty-fields"));
    toggleDialog();
    isLoaderShown.value = false;
    enableValidate.value = true;
    return;
  }
  try {
    const newCharity: Charity = JSON.parse(
      JSON.stringify(charityDetails.value)
    );
    const result = await charities.addCharity(
      newCharity,
      charityStorageData.value
    );
    if (!result) {
      return;
    }
    resetForm();
    isLoaderShown.value = false;
    dialog.value = true;
  } catch (e) {
    isLoaderShown.value = false;
    console.error(e);
  }
};

const initializeUsers = () => {
  usersStore.getUsers();
};

const resetForm = () => {
  const charityDetailsKeys = Object.keys(charityDetails.value);
  charityDetailsKeys.forEach((key: string | number | boolean) => {
    if (key === "views" || key === "likes") {
      charityDetails.value[key] = 0;
    } else if (key === "isFeatured" || key === "isVerified") {
      charityDetails.value[key] = false;
    } else {
      // @ts-expect-error: String is not allowed
      charityDetails.value[key as keyof Charity] = "";
    }
  });
  const storageDataKeys = Object.keys(charityStorageData.value);
  storageDataKeys.forEach((key) => {
    // @ts-expect-error: String is not allowed
    charityStorageData.value[key] = undefined;
  });
};

const createDisplayPicturePreview = (file: File) => {
  if (file === undefined) {
    return;
  }
  displayPictureUrlPreview.value = "";
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target === null) {
      return;
    }
    displayPictureUrlPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};
const createCoverPicturePreview = (file: File) => {
  if (file === undefined) {
    return;
  }
  coverPictureUrlPreview.value = "";
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target === null) {
      return;
    }
    coverPictureUrlPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const uploadFile = (event: HTMLInputEvent, type: string) => {
  if (hasFormError.value) {
    toggleFormError();
  }
  if (!event.target.files) {
    return;
  }
  const hasFileError = handleFileForm(event.target.files[0], type);
  if (hasFileError) {
    return;
  }
  if (type === "displayPicture") {
    createDisplayPicturePreview(event.target.files[0]);
  }
  if (type === "coverPicture") {
    createCoverPicturePreview(event.target.files[0]);
  }
  // @ts-expect-error: String is not allowed
  charityStorageData.value[type] = event.target.files[0];
};

const handleFileForm = (file: File, category: string) => {
  const MAX_BYTES_SIZE = 1000000;
  const DOCUMENT_TYPE = "application/pdf";
  const JPEG_TYPE = "image/jpeg";
  const PNG_TYPE = "image/png";
  if (file.size >= MAX_BYTES_SIZE) {
    toggleFormError();
    addErrorText(handleErrorMessage("file/too-big"));
    toggleDialog();
    return true;
  }
  if (category === "documents") {
    if (file.type != DOCUMENT_TYPE) {
      toggleFormError();
      addErrorText(handleErrorMessage("file/doc-invalid"));
      toggleDialog();
      return true;
    }
  } else if (file.type != JPEG_TYPE && file.type != PNG_TYPE) {
    toggleFormError();
    addErrorText(handleErrorMessage("file/image-invalid"));
    toggleDialog();
    return true;
  }
};

const handleErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case "file/too-big":
      return "The file is too big. Please compress it or add a new one.";
    case "file/doc-invalid":
      return "The document file can only be in PDF format. Please, add the correct file.";
    case "file/image-invalid":
      return "The images can only be of type .jpeg or .png. Please, add the correct file.";
    case "form/empty-fields":
      return "Form cannot be empty. Please, fill the fields.";
    default:
      return "An error happened. Please, try again.";
  }
};

const handleDialog = () => {
  if (hasFormError.value) {
    return (dialog.value = false);
  }
  return returnHome();
};

const returnHome = () => {
  dialog.value = false;
  router.push("/menu/charities");
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
  const canCreateCharities =
    usersStore.loggedInUser.privileges["add-charities"];
  if (canCreateCharities) {
    togglePrivilegeLoader();
    return;
  } else {
    router.push("/");
  }
};

const togglePrivilegeLoader = () => {
  hasPrivileges.value = !hasPrivileges.value;
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

const initializeConnections = async (type: string) => {
  const connectionsTitles = await connectionsStore.getConnections(type);
  return connectionsTitles.map((connection) => connection.title);
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
            <v-col cols="12" xs="12" sm="6" lg="4">
              <TextField
                label="Title"
                v-model="charityDetails.title"
                :error-messages="enableValidate && !charityDetails.title ? 'Field is required' : ''"
              ></TextField>
            </v-col>
            <v-col cols="12" xs="12" sm="6" lg="4">
              <TextField
                label="Subtitle/slogan"
                v-model="charityDetails.subtitle"
                :error-messages="enableValidate && !charityDetails.subtitle ? 'Field is required' : ''"
              ></TextField>
            </v-col>
            <v-col cols="12" xs="12" sm="6" lg="4">
              <SelectField
                label="Category"
                :items="categories"
                v-model="charityDetails.category"
                :error-messages="enableValidate && !charityDetails.category ? 'Field is required' : ''"
              >
              </SelectField>
            </v-col>
            <v-col cols="12" xs="12" sm="6" lg="4">
              <SelectField
                label="Beneficiary"
                :items="beneficiaries"
                v-model="charityDetails.beneficiary"
                :error-messages="enableValidate && !charityDetails.beneficiary ? 'Field is required' : ''"
              >
              </SelectField>
            </v-col>
            <v-col cols="12" xs="12" sm="6" lg="4">
              <SelectField
                label="Operation"
                :items="operations"
                v-model="charityDetails.operation"
                :error-messages="enableValidate && !charityDetails.operation ? 'Field is required' : ''"
              >
              </SelectField>
            </v-col>
            <v-col cols="12" xs="12" sm="6" lg="4" v-if="usersStore.loggedInUser.role == 'admin'">
              <SelectField
                label="User"
                :items="users"
                v-model="charityDetails.user"
                :error-messages="enableValidate && !charityDetails.user ? 'Field is required' : ''"
              >
              </SelectField>
            </v-col>
            <v-col cols="12" xs="12" sm="12" md="12" lg="4" v-if="usersStore.loggedInUser.role == 'admin'">
              <SelectField
                label="Status"
                :items="sortedStatus"
                v-model="charityDetails.status"
                :error-messages="enableValidate && !charityDetails.status ? 'Field is required' : ''"
              >
              </SelectField>
            </v-col>
            <v-col cols="12" xs="12" sm="6" lg="4">
              <v-file-input
                label="Display picture (1:1)"
                @change="(e: HTMLInputEvent) => uploadFile(e, 'displayPicture')"
                variant="outlined"
                color="secondary"
                hide-details="auto"
                prepend-icon="mdi-camera"
              ></v-file-input>
            </v-col>
            <v-col cols="12" xs="12" sm="6" lg="4">
              <v-file-input
                label="Display cover (16:9)"
                @change="(e: HTMLInputEvent) => uploadFile(e, 'coverPicture')"
                variant="outlined"
                color="secondary"
                hide-details="auto"
                prepend-icon="mdi-panorama"
              ></v-file-input>
            </v-col>
            <v-col cols="12" xs="12" sm="6" md="12" lg="6">
              <v-textarea
                hide-details="auto"
                v-model="charityDetails.longDescription"
                color="secondary"
                outlined
                name="input-7-4"
                :label="charityDetails.longDescription ? charityDetails.longDescription.length + '/250' : 'Long Description (Max. 250)'"
                :error-messages="enableValidate && !charityDetails.longDescription ? 'Field is required' : ''"
                :maxlength="250"
              ></v-textarea>
            </v-col>
            <v-col cols="12" xs="12" sm="6" md="12" lg="6">
              <v-row>
                <v-col cols="12" xs="12" sm="12" md="6" lg="12">
                  <TextField
                    :label="charityDetails.shortDescription ? charityDetails.shortDescription.length + '/60' : 'Short Description (Max. 60)'"
                    v-model="charityDetails.shortDescription"
                    maxLength="60"
                    :error-messages="enableValidate && !charityDetails.shortDescription ? 'Field is required' : ''"
                  ></TextField>
                </v-col>
                <v-col cols="12" xs="12" sm="12" md="6" lg="12">
                  <TextField
                    label="URL"
                    v-model="charityDetails.URL"
                    :error-messages="enableValidate && !charityDetails.URL ? 'Field is required' : ''"
                  ></TextField>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </div>
    <v-divider></v-divider>
    <v-toolbar color="transparent">
      <v-toolbar-title class="font-weight-medium"
        >Additional information</v-toolbar-title
      >
    </v-toolbar>
    <div class="pa-5">
      <v-form>
        <v-container>
          <v-row>
            <v-col cols="12" xs="12">
              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-title
                    >More charity details</v-expansion-panel-title
                  >
                  <v-expansion-panel-text>
                    <v-row class="pa-5">
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Open charity number"
                          v-model="charityDetails.charityNumber"
                          :error-messages="enableValidate && !charityDetails.charityNumber ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Open charity URL"
                          v-model="charityDetails.charityURL"
                          :error-messages="enableValidate && !charityDetails.charityURL ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Start date"
                          type="date"
                          v-model="charityDetails.startDate"
                          :error-messages="enableValidate && !charityDetails.startDate ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Registration date"
                          type="date"
                          v-model="charityDetails.registrationDate"
                          :error-messages="enableValidate && !charityDetails.registrationDate ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Date removed"
                          type="date"
                          v-model="charityDetails.removeDate"
                          :error-messages="enableValidate && !charityDetails.removeDate ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Last checked"
                          type="date"
                          v-model="charityDetails.lastChecked"
                          :error-messages="enableValidate && !charityDetails.lastChecked ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title
                    >Addresses and contacts</v-expansion-panel-title
                  >
                  <v-expansion-panel-text>
                    <v-row class="pa-5">
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Contact name"
                          v-model="charityDetails.contactName"
                          :error-messages="enableValidate && !charityDetails.contactName ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Contact number"
                          v-model="charityDetails.contactNumber"
                          :error-messages="enableValidate && !charityDetails.contactNumber ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="E-mail"
                          v-model="charityDetails.contactEmail"
                          :error-messages="enableValidate && !charityDetails.contactEmail ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Address"
                          v-model="charityDetails.address"
                          :error-messages="enableValidate && !charityDetails.address ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <SelectField
                          label="Country"
                          :items="sortedCountries"
                          v-model="charityDetails.country"
                          :error-messages="enableValidate && !charityDetails.country ? 'Field is required' : ''"
                        >
                        </SelectField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Website URL"
                          v-model="charityDetails.website"
                          :error-messages="enableValidate && !charityDetails.website ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Twitter URL"
                          v-model="charityDetails.twitter"
                          :error-messages="enableValidate && !charityDetails.twitter ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Facebook URL"
                          v-model="charityDetails.facebook"
                          :error-messages="enableValidate && !charityDetails.facebook ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" md="4">
                        <TextField
                          label="Youtube URL"
                          v-model="charityDetails.youtube"
                          :error-messages="enableValidate && !charityDetails.youtube ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" md="4">
                        <TextField
                          label="Instagram URL"
                          v-model="charityDetails.instagram"
                          :error-messages="enableValidate && !charityDetails.instagram ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" md="4">
                        <TextField
                          label="Feed URL"
                          v-model="charityDetails.feed"
                          :error-messages="enableValidate && !charityDetails.feed ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title
                    >Finance and account details</v-expansion-panel-title
                  >
                  <v-expansion-panel-text>
                    <v-row class="pa-5">
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Accounts date"
                          type="date"
                          v-model="charityDetails.accountsDate"
                          :error-messages="enableValidate && !charityDetails.accountsDate ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Total spending"
                          v-model="charityDetails.totalSpent"
                          :error-messages="enableValidate && !charityDetails.totalSpent ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Total income"
                          v-model="charityDetails.totalIncome"
                          :error-messages="enableValidate && !charityDetails.totalIncome ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <TextField
                          label="Collected donation"
                          v-model="charityDetails.collectedDonation"
                          :error-messages="enableValidate && !charityDetails.collectedDonation ? 'Field is required' : ''"
                        ></TextField>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title>Documents</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row class="pa-5">
                      <v-col>
                        <v-alert class="mb-3" type="info" variant="outlined"
                          >PDF files for verification</v-alert
                        >
                      </v-col>
                      <v-col cols="12" xs="12" sm="6" lg="6">
                        <v-file-input
                          label="Documents"
                          @change="(e: HTMLInputEvent) => uploadFile(e, 'documents')"
                          variant="outlined"
                          color="secondary"
                          hide-details="auto"
                          prepend-icon="mdi-file-pdf-box"
                        ></v-file-input>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </div>
    <template v-if="isImageLoaded">
      <v-toolbar color="transparent">
        <v-toolbar-title class="font-weight-medium"
          >Image preview</v-toolbar-title
        >
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-divider></v-divider>
      <div class="pa-5 mb-5">
        <v-row>
          <v-col v-if="isDisplayPictureLoaded" cols="12" sm="6">
            <v-row>
              <span>Display picture preview</span>
              <v-col cols="12" class="d-flex justify-start align-center">
                <div class="w-auto h-auto">
                  <v-img
                    class="mt-2 img-fluid"
                    :src="(displayPictureUrlPreview as string | undefined) "
                    height="100"
                    width="100"
                    :cover="true"
                  />
                </div>
                <v-btn
                  @click="showDisplayPictureDialog"
                  large
                  color="secondary"
                  class="ml-2"
                  >Show full image
                  <v-dialog v-model="displayPictureDialog" fullscreen>
                    <v-card>
                      <v-toolbar dark color="secondary">
                        <v-btn icon dark @click="displayPictureDialog = false">
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
                            :src="(displayPictureUrlPreview as string | undefined)"
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
          </v-col>
          <v-col v-if="isCoverPictureLoaded" cols="12" sm="6">
            <v-row>
              <span>Cover picture preview</span>
              <v-col cols="12" class="d-flex justify-start align-center">
                <div class="w-auto h-auto">
                  <v-img
                    class="mt-2 img-fluid"
                    :src="(coverPictureUrlPreview as string | undefined) "
                    height="100"
                    width="100"
                    :cover="true"
                  />
                </div>
                <v-btn
                  @click="showCoverPictureDialog"
                  large
                  color="secondary"
                  class="ml-2"
                  >Show full image
                  <v-dialog v-model="coverPictureDialog" fullscreen>
                    <v-card>
                      <v-toolbar dark color="secondary">
                        <v-btn icon dark @click="coverPictureDialog = false">
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
                            :src="(coverPictureUrlPreview as string | undefined)"
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
          </v-col>
        </v-row>
      </div>
    </template>
    <v-divider></v-divider>
    <v-btn block color="secondary" size="large" @click.stop="createCharity">
      <v-dialog v-model="dialog" class="pa-2" persistent>
        <v-card>
          <v-card-text class="text-center">{{ dialogText }}</v-card-text>
          <v-card-actions>
            <v-btn
              :color="buttonDialogColor"
              variant="outlined"
              block
              @click="handleDialog"
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
      <span v-else class="text-none">Create charity</span></v-btn
    >
  </v-card>
</template>
