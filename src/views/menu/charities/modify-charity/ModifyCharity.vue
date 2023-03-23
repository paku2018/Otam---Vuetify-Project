<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { Ref } from "vue";
import { sortCountries } from "../add-charity/data/functions";
import { useCharities } from "@/stores/charities";
import { useUsers } from "@/stores/users";
import { status } from "../add-charity/data/data";
import { db } from "@/firebase";
import { useConnections } from "@/stores/connections";
import { doc, getDoc } from "firebase/firestore";
import BaseBreadcrumb from "@/components/BaseBreadcrumb.vue";
import TextField from "@/components/TextField.vue";
import SelectField from "@/components/SelectField.vue";

// <-- Types -->
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

// <-- Lifecycle Hooks -->
onMounted(async () => {
  await getCharityToModify();
  await initializeCountries();
  await initializeUsers();
  getUserPrivileges();
  beneficiaries.value = await initializeConnections("beneficiaries");
  operations.value = await initializeConnections("operations");
  categories.value = await initializeConnections("categories");
  isCharityToModify.value = true;
});

// <-- Stores -->
const charitiesStore = useCharities();
const usersStore = useUsers();
const connectionsStore = useConnections();

// <-- Variables -->
const page = ref({ title: "Modify charity" });
const breadcrumbs = ref([{ text: "Edit charity details", disabled: false }]);
const sortedCountries: Ref<string[]> = ref([]);
const dialog = ref(false);
const router = useRouter();
const route = useRoute();
const isCharityToModify = ref(false);
const charityToModify = ref();
const isLoaderShown = ref(false);
const charityStorageData = ref({
  displayPicture: undefined,
  coverPicture: undefined,
  documents: undefined,
});
const hasPrivileges = ref(false);
const hasFormError = ref(false);
const formErrorText = ref("An error happened. Please, try again");
const displayPictureUrlPreview: Ref<string | ArrayBuffer | null> = ref("");
const coverPictureUrlPreview: Ref<string | ArrayBuffer | null> = ref("");
const displayPictureDialog = ref(false);
const coverPictureDialog = ref(false);
const categories: Ref<string[] | []> = ref([]);
const operations: Ref<string[] | []> = ref([]);
const beneficiaries: Ref<string[] | []> = ref([]);

// <-- Computed Properties -->
const isImageLoaded = computed(
  () => isDisplayPictureLoaded.value || isCoverPictureLoaded.value
);

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

const users = computed(() => {
  return usersStore.users.map((user) => user.displayName);
});
const sortedStatus = computed(() => {
  return status.sort();
});
const isCreator = computed(
  () => charityToModify.value.createdBy === usersStore.loggedInUser.uid
);

// <-- Functions -->
const showDisplayPictureDialog = () => {
  displayPictureDialog.value = true;
};
const showCoverPictureDialog = () => {
  coverPictureDialog.value = true;
};

const returnHome = () => {
  dialog.value = false;
  router.push("/menu/charities");
};

const initializeCountries = async () => {
  const countryList = await sortCountries();
  sortedCountries.value = countryList;
};

const getCharityToModify = async () => {
  const docSnap = await getDoc(doc(db, "charities", `${route.params.id}`));
  charityToModify.value = {
    accountsDate: docSnap?.data()?.accountsDate,
    address: docSnap?.data()?.address,
    beneficiary: docSnap?.data()?.beneficiary,
    category: docSnap?.data()?.category,
    charityNumber: docSnap?.data()?.charityNumber,
    charityURL: docSnap?.data()?.charityURL,
    collectedDonation: docSnap?.data()?.collectedDonation,
    contactEmail: docSnap?.data()?.contactEmail,
    contactName: docSnap?.data()?.contactName,
    createdBy: docSnap?.data()?.createdBy,
    contactNumber: docSnap?.data()?.contactNumber,
    country: docSnap?.data()?.country,
    facebook: docSnap?.data()?.facebook,
    feed: docSnap?.data()?.feed,
    id: docSnap.id,
    instagram: docSnap?.data()?.instagram,
    lastChecked: docSnap?.data()?.lastChecked,
    longDescription: docSnap?.data()?.longDescription,
    operation: docSnap?.data()?.operation,
    registrationDate: docSnap?.data()?.registrationDate,
    removeDate: docSnap?.data()?.removeDate,
    shortDescription: docSnap?.data()?.shortDescription,
    startDate: docSnap?.data()?.startDate,
    status: docSnap?.data()?.status,
    subtitle: docSnap?.data()?.subtitle,
    title: docSnap?.data()?.title,
    totalIncome: docSnap?.data()?.totalIncome,
    totalSpent: docSnap?.data()?.totalSpent,
    twitter: docSnap?.data()?.twitter,
    URL: docSnap?.data()?.URL,
    user: docSnap?.data()?.user,
    website: docSnap?.data()?.website,
    youtube: docSnap?.data()?.youtube,
  };
};

const initializeUsers = () => {
  usersStore.getUsers();
};

const modifyCharity = async () => {
  isLoaderShown.value = true;
  const modifiedCharity = JSON.parse(JSON.stringify(charityToModify.value));
  try {
    const updateResult = await charitiesStore.updateCharityDetails(
      route.params.id as string,
      modifiedCharity
    );
    const storageResult = await charitiesStore.addCharityStorageData(
      charityStorageData.value,
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

const toggleFormError = () => {
  hasFormError.value = !hasFormError.value;
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

const addErrorText = (string = "An error has occurred, please try again") => {
  formErrorText.value = string;
};

const toggleDialog = () => {
  dialog.value = !dialog.value;
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
  const canModifyCharities =
    usersStore.loggedInUser.privileges["modify-charities"];
  if (canModifyCharities || isCreator.value) {
    togglePrivilegeLoader();
    return;
  } else {
    router.push("/");
  }
};

const togglePrivilegeLoader = () => {
  hasPrivileges.value = !hasPrivileges.value;
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
    <template v-if="!isCharityToModify">
      <div class="pa-5 text-center">
        <v-progress-circular
          indeterminate
          color="secondary"
        ></v-progress-circular>
      </div>
    </template>
    <template v-if="isCharityToModify">
      <div class="pa-5">
        <v-form>
          <v-container>
            <v-row>
              <v-col cols="12" xs="12" sm="6" lg="4">
                <TextField
                  label="Title"
                  v-model="charityToModify.title"
                  :error-messages="charityToModify.title ? '' : 'Field is required'"
                ></TextField>
              </v-col>
              <v-col cols="12" xs="12" sm="6" lg="4">
                <TextField
                  label="Subtitle/slogan"
                  v-model="charityToModify.subtitle"
                  :error-messages="charityToModify.subtitle ? '' : 'Field is required'"
                ></TextField>
              </v-col>
              <v-col cols="12" xs="12" sm="6" lg="4">
                <SelectField
                  label="Category"
                  :items="categories"
                  v-model="charityToModify.category"
                  :error-messages="charityToModify.category ? '' : 'Field is required'"
                >
                </SelectField>
              </v-col>
              <v-col cols="12" xs="12" sm="6" lg="4">
                <SelectField
                  label="Beneficiary"
                  :items="beneficiaries"
                  v-model="charityToModify.beneficiary"
                  :error-messages="charityToModify.beneficiary ? '' : 'Field is required'"
                >
                </SelectField>
              </v-col>
              <v-col cols="12" xs="12" sm="6" lg="4">
                <SelectField
                  label="Operation"
                  :items="operations"
                  v-model="charityToModify.operation"
                  :error-messages="charityToModify.operation ? '' : 'Field is required'"
                >
                </SelectField>
              </v-col>
              <v-col cols="12" xs="12" sm="6" lg="4" v-if="usersStore.loggedInUser.role == 'admin'">
                <SelectField
                  label="User"
                  :items="users"
                  v-model="charityToModify.user"
                  :error-messages="charityToModify.user ? '' : 'Field is required'"
                >
                </SelectField>
              </v-col>
              <v-col cols="12" xs="12" sm="12" md="12" lg="4" v-if="usersStore.loggedInUser.role == 'admin'">
                <SelectField
                  label="Status"
                  :items="sortedStatus"
                  v-model="charityToModify.status"
                  :error-messages="charityToModify.status ? '' : 'Field is required'"
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
                  label="Cover picture (16:9)"
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
                  v-model="charityToModify.longDescription"
                  color="secondary"
                  outlined
                  name="input-7-4"
                  :label="charityToModify.longDescription ? charityToModify.longDescription.length + '/250' : 'Long Description (Max. 250)'"
                  :error-messages="charityToModify.longDescription ? '' : 'Field is required'"
                  :maxlength="250"
                ></v-textarea>
              </v-col>
              <v-col cols="12" xs="12" sm="6" md="12" lg="6">
                <v-row>
                  <v-col cols="12" xs="12" sm="12" md="6" lg="12">
                    <TextField
                       :label="charityToModify.shortDescription ? charityToModify.shortDescription.length + '/60' : 'Short Description (Max. 60)'"
                      v-model="charityToModify.shortDescription"
                      maxLength="60"
                      :error-messages="charityToModify.shortDescription ? '' : 'Field is required'"
                    ></TextField>
                  </v-col>
                  <v-col cols="12" xs="12" sm="12" md="6" lg="12">
                    <TextField
                      label="URL"
                      v-model="charityToModify.URL"
                      :error-messages="charityToModify.URL ? '' : 'Field is required'"
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
                            v-model="charityToModify.charityNumber"
                            :error-messages="charityToModify.charityNumber ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Open charity URL"
                            v-model="charityToModify.charityURL"
                            :error-messages="charityToModify.charityURL ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Start date"
                            type="date"
                            v-model="charityToModify.startDate"
                            :error-messages="charityToModify.startDate ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Registration date"
                            type="date"
                            v-model="charityToModify.registrationDate"
                            :error-messages="charityToModify.registrationDate ? '' : 'Field is required'"
                          >
                          </TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Date removed"
                            type="date"
                            v-model="charityToModify.removeDate"
                            :error-messages="charityToModify.removeDate ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Last checked"
                            type="date"
                            v-model="charityToModify.lastChecked"
                            :error-messages="charityToModify.lastChecked ? '' : 'Field is required'"
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
                            v-model="charityToModify.contactName"
                            :error-messages="charityToModify.contactName ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Contact number"
                            v-model="charityToModify.contactNumber"
                            :error-messages="charityToModify.contactNumber ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="E-mail"
                            v-model="charityToModify.contactEmail"
                            :error-messages="charityToModify.contactEmail ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Address"
                            v-model="charityToModify.address"
                            :error-messages="charityToModify.address ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <SelectField
                            label="Country"
                            :items="sortedCountries"
                            v-model="charityToModify.country"
                            :error-messages="charityToModify.country ? '' : 'Field is required'"
                          >
                          </SelectField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Website URL"
                            v-model="charityToModify.website"
                            :error-messages="charityToModify.website ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Twitter URL"
                            v-model="charityToModify.twitter"
                            :error-messages="charityToModify.twitter ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Facebook URL"
                            v-model="charityToModify.facebook"
                            :error-messages="charityToModify.facebook ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" md="4">
                          <TextField
                            label="Youtube URL"
                            v-model="charityToModify.youtube"
                            :error-messages="charityToModify.youtube ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" md="4">
                          <TextField
                            label="Instagram URL"
                            v-model="charityToModify.instagram"
                            :error-messages="charityToModify.instagram ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" md="4">
                          <TextField
                            label="Feed URL"
                            v-model="charityToModify.feed"
                            :error-messages="charityToModify.feed ? '' : 'Field is required'"
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
                            v-model="charityToModify.accountsDate"
                            :error-messages="charityToModify.accountsDate ? '' : 'Field is required'"
                          >
                          </TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Total spending"
                            v-model="charityToModify.totalSpent"
                            :error-messages="charityToModify.totalSpent ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Total income"
                            v-model="charityToModify.totalIncome"
                            :error-messages="charityToModify.totalIncome ? '' : 'Field is required'"
                          ></TextField>
                        </v-col>
                        <v-col cols="12" xs="12" sm="6" lg="6">
                          <TextField
                            label="Collected donation"
                            v-model="charityToModify.collectedDonation"
                            :error-messages="charityToModify.collectedDonation ? '' : 'Field is required'"
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
                          <v-btn
                            icon
                            dark
                            @click="displayPictureDialog = false"
                          >
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
      <v-btn block color="secondary" size="large" @click="modifyCharity">
        <v-dialog v-model="dialog" class="pa-2" persistent>
          <v-card>
            <v-card-text>{{ dialogText }}</v-card-text>
            <v-card-actions>
              <v-btn
                :color="buttonDialogColor"
                variant="outlined"
                block
                @click="handleDialog"
              >
                <v-icon>{{ dialogIcon }}</v-icon
                >{{ dialogButtonText }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-progress-circular
          v-if="isLoaderShown"
          indeterminate
          color="white"
        ></v-progress-circular>
        <span v-else class="text-none">Modify charity</span>
      </v-btn>
    </template>
  </v-card>
</template>
