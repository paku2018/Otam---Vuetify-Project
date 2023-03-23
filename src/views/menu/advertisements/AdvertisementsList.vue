<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUsers } from "@/stores/users";
import BaseBreadcrumb from "@/components/BaseBreadcrumb.vue";
import VueSnackbar from "@/components/VueSnackbar.vue";
import { useAdvertisements } from "@/stores/advertisements";
import AdvertisementItem from "./components/AdvertisementItem.vue";

// <-- Lifecycle Hooks -->
onMounted(() => {
  getUserPrivileges()  
});

//<-- Stores -->
const advertisementsStore = useAdvertisements();
const router = useRouter();
const usersStore = useUsers();
const showOwned = ref(false);

// <-- Variables -->
const page = ref({ title: "Advertisements" });
const breadcrumbs = ref([
  {
    text: "List of current advertisements",
    disabled: false,
  },
]);
const search = ref("");
const showFeatured = ref(false);
const isLoaderShown = ref(false);
const isSnackbarShown = ref(false);
const snackbarText = ref("Action completed");

// <-- Computed -->
const canCreateAdvertisements = computed(
  () => usersStore.loggedInUser.privileges["add-advertisements"]
);

const sortedAdvertisements = computed(() => {
  return advertisementsStore.advertisements.sort(function(a,b){
    return new Date(b.date) > new Date(a.date) ? 1 : -1
  })
});
const areAdvertisementsCreated = computed(() => {
  return advertisementsStore.advertisements.length === 0 ? false : true;
});
const isBeingSearched = computed(() => {
  return search.value != "" ? true : false;
});
const filteredList = computed(() => {
  return advertisementsStore.advertisements.filter((ad: any) => {
    return ad.title.toLowerCase().includes(search.value.toLowerCase());
  }).sort(function(a,b){
    return new Date(b.date) > new Date(a.date) ? 1 : -1
  });
});
const areAdvertisementsFound = computed(() => {
  return filteredList.value.length === 0 ? false : true;
});
const areAdvertisementsFeatured = computed(() => {
  const featuredList = advertisementsStore.advertisements.filter(
    (advertisement) => advertisement.isFeatured === true
  );
  return featuredList.length === 0 ? false : true;
});
const ownAdvertisements = computed(() =>
  advertisementsStore.advertisements.filter(
    (ad) => ad.createdBy === usersStore.loggedInUser.uid
  ).sort(function(a,b){
    return new Date(b.date) > new Date(a.date) ? 1 : -1
  })
);
const areOwnAdvertisementsCreated = computed(() => {
  return ownAdvertisements.value.length > 0;
});

// <-- Functions -->
const initializeAdvertisements = async () => {
  isLoaderShown.value = true;
  try {
    await advertisementsStore.getAdvertisements();
    isLoaderShown.value = false;
    toggleSnackbar("Loading completed", true);
    setTimeout(() => {
      toggleSnackbar("Closing", false);
    }, 2000);
  } catch (error) {
    console.error(error);
    isLoaderShown.value = false;
    toggleSnackbar("Loading failed. Please, try again.", true);
    setTimeout(() => {
      toggleSnackbar("Closing", false);
    }, 2000);
  }
};
const handleDelete = async (id: string, file: string) => {
  isLoaderShown.value = true;
  try {
    await advertisementsStore.deleteAdvertisement(id, file);
    await initializeAdvertisements();
    isLoaderShown.value = false;
    toggleSnackbar("Deletion completed", true);
  } catch (error) {
    console.error(error);
    isLoaderShown.value = false;
    toggleSnackbar("Deletion failed. Please, try again.", true);
  }
};
const handleFeatured = async (id: string) => {
  isLoaderShown.value = true;
  try {
    await advertisementsStore.handleFeaturedAdvertisement(id);
    await initializeAdvertisements();
    isLoaderShown.value = false;
    toggleSnackbar("Feature action completed", true);
  } catch (error) {
    console.error(error);
    isLoaderShown.value = false;
    toggleSnackbar("Feature action failed. Please, try again.", true);
  }
};
const handleModify = async (id: string) => {
  router.push(`/menu/advertisements/modify-advertisement/${id}`);
};

const toggleSnackbar = (text: string, value: boolean) => {
  isSnackbarShown.value = value;
  snackbarText.value = text;
  return;
};

const getUserPrivileges = () => {
  const userRole = usersStore.loggedInUser.role;
  if (userRole === "") {
    setTimeout(() => {
      getUserPrivileges();
    }, 200);
  } else if(userRole == "admin") {
    initializeAdvertisements();
  } else {
    router.push("/");
  }
};
</script>

<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-card>
    <v-card-text class="pa-5">
      <v-row>
        <v-col
          cols="12"
          md="12"
          lg="4"
          class="d-flex align-center justify-center"
        >
          <v-text-field
            density="compact"
            v-model="search"
            :disabled="!areAdvertisementsCreated || showFeatured || showOwned"
            label="Search advertisements"
            hide-details
            variant="outlined"
            color="secondary"
          ></v-text-field>
        </v-col>
        <v-col
          v-if="canCreateAdvertisements"
          cols="12"
          sm="4"
          md="4"
          lg="3"
          class="d-flex align-center justify-center"
        >
          <v-switch
            hide-details
            label="Show own ads."
            color="warning"
            :disabled="!areAdvertisementsCreated"
            v-model="showOwned"
          ></v-switch>
        </v-col>
        <v-col
          cols="12"
          sm="4"
          md="4"
          lg="3"
          class="d-flex align-center justify-center"
        >
          
        </v-col>
        <v-col
          v-if="canCreateAdvertisements"
          cols="12"
          sm="4"
          md="4"
          lg="2"
          class="text-right d-flex align-center justify-start justify-sm-end"
        >
          <v-btn
            color="secondary"
            to="/menu/advertisements/add-advertisement"
            class="text-none"
          >
            <vue-feather
              type="plus"
              class="feather-sm mr-2"
              stroke="white"
            ></vue-feather>
            Add advertisement</v-btn
          >
        </v-col>
      </v-row>
      <v-table class="mt-5">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Date</th>           
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="isLoaderShown">
            <tr>
              <td colspan="6" class="pa-5 text-center">
                <v-progress-circular
                  indeterminate
                  color="secondary"
                ></v-progress-circular>
              </td>
            </tr>
          </template>
          <template v-else>
            <template v-if="areAdvertisementsCreated">
              <template v-if="isBeingSearched">
                <template v-if="areAdvertisementsFound"
                  ><tr
                    v-for="advertisement in filteredList"
                    :key="advertisement.id"
                  >
                    <AdvertisementItem
                      :file="advertisement.file"
                      :createdBy="advertisement.createdBy"
                      :date="advertisement.date"
                      :id="advertisement.id"
                      :is-featured="advertisement.isFeatured"
                      :likes="advertisement.likes"
                      :title="advertisement.title"
                      :type="advertisement.type"
                      :views="advertisement.views"
                      @handle-delete="handleDelete"
                      @handle-modify="handleModify"
                      @handle-featured="handleFeatured"
                    ></AdvertisementItem>
                  </tr>
                </template>
                <template v-if="!areAdvertisementsFound">
                  <tr>
                    <td colspan="6" class="pa-5">
                      <h3 class="text-center text-grey">
                        No advertisements found
                      </h3>
                    </td>
                  </tr>
                </template>
              </template>
              <template v-else-if="!showFeatured && !showOwned">
                <tr
                  v-for="advertisement in sortedAdvertisements"
                  :key="advertisement.id"
                >
                  <AdvertisementItem
                    :file="advertisement.file"
                    :createdBy="advertisement.createdBy"
                    :date="advertisement.date"
                    :id="advertisement.id"
                    :is-featured="advertisement.isFeatured"
                    :likes="advertisement.likes"
                    :title="advertisement.title"
                    :type="advertisement.type"
                    :views="advertisement.views"
                    @handle-delete="handleDelete"
                    @handle-modify="handleModify"
                    @handle-featured="handleFeatured"
                  ></AdvertisementItem>
                </tr>
              </template>
              <template v-else-if="showFeatured">
                <template v-if="areAdvertisementsFeatured">
                  <tr
                    v-for="advertisement in sortedAdvertisements"
                    :key="advertisement.id"
                  >
                    <AdvertisementItem
                      :file="advertisement.file"
                      :createdBy="advertisement.createdBy"
                      v-if="advertisement.isFeatured"
                      :date="advertisement.date"
                      :id="advertisement.id"
                      :is-featured="advertisement.isFeatured"
                      :likes="advertisement.likes"
                      :title="advertisement.title"
                      :type="advertisement.type"
                      :views="advertisement.views"
                      @handle-delete="handleDelete"
                      @handle-modify="handleModify"
                      @handle-featured="handleFeatured"
                    ></AdvertisementItem>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td colspan="6" class="pa-5">
                      <h3 class="text-center text-grey">
                        No advertisements featured
                      </h3>
                    </td>
                  </tr>
                </template>
              </template>
              <template v-else-if="showOwned">
                <template v-if="areOwnAdvertisementsCreated">
                  <tr
                    v-for="advertisement in ownAdvertisements"
                    :key="advertisement.id"
                  >
                    <AdvertisementItem
                      :file="advertisement.file"
                      :createdBy="advertisement.createdBy"
                      :date="advertisement.date"
                      :id="advertisement.id"
                      :is-featured="advertisement.isFeatured"
                      :likes="advertisement.likes"
                      :title="advertisement.title"
                      :type="advertisement.type"
                      :views="advertisement.views"
                      @handle-delete="handleDelete"
                      @handle-modify="handleModify"
                      @handle-featured="handleFeatured"
                    ></AdvertisementItem>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td colspan="6" class="pa-5">
                      <h3 class="text-center text-grey">
                        No advertisements owned
                      </h3>
                    </td>
                  </tr>
                </template>
              </template>
            </template>
            <template v-else>
              <tr>
                <td colspan="6" class="pa-5">
                  <h3 class="text-center text-grey">
                    No advertisements created
                  </h3>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
  <VueSnackbar
    :is-visible="isSnackbarShown"
    :text="snackbarText"
    @close-snackbar="toggleSnackbar(`Closing...`, false)"
  />
</template>
