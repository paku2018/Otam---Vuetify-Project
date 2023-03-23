<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCharities } from "@/stores/charities";
import { useUsers } from "@/stores/users";
import BaseBreadcrumb from "@/components/BaseBreadcrumb.vue";
import CharityItem from "./components/CharityItem.vue";
import VueSnackbar from "@/components/VueSnackbar.vue";

// <-- Lifecycle Hooks -->
onMounted(async () => {
  await initializeCharities();
});

// <-- Stores -->
const charitiesStore = useCharities();
const usersStore = useUsers();
const router = useRouter();

// <-- Variables -->
const page = ref({ title: "Charities" });
const breadcrumbs = ref([
  { text: "List of current charities", disabled: false },
]);
const search = ref("");
const showFeatured = ref(false);
const showOwned = ref(false);
const isLoaderShown = ref(false);
const isSnackbarShown = ref(false);
const snackbarText = ref("Action completed");

// <-- Computed -->

const canCreateCharities = computed(
  () => usersStore.loggedInUser.privileges["add-charities"]
);

const canVerifyCharities = computed(
  () => usersStore.loggedInUser.privileges["verify-charities"]
);

const filteredList = computed(() => {
  return charitiesStore.charities.filter((charity) => {
    return charity.title.toLowerCase().includes(search.value.toLowerCase());
  });
});
const areCharitiesFound = computed(() => {
  return filteredList.value.length === 0 ? false : true;
});
const isBeingSearched = computed(() => {
  return search.value != "" ? true : false;
});
const areCharitiesFeatured = computed(() => {
  const featuredList = charitiesStore.charities.filter(
    (charity) => charity.isFeatured === true
  );
  return featuredList.length === 0 ? false : true;
});
const areCharitiesCreated = computed(() => {
  return charitiesStore.charities.length === 0 ? false : true;
});
const ownCharities = computed(() =>
  charitiesStore.charities.filter(
    (charity) => charity.createdBy === usersStore.loggedInUser.uid
  )
);
const areOwnCharitiesCreated = computed(() => {
  return ownCharities.value.length > 0;
});

// <-- Functions -->
const initializeCharities = async () => {
  isLoaderShown.value = true;
  try {
    await charitiesStore.getCharities();
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

const handleDelete = async (
  id: string,
  displayPicture: string,
  coverPicture: string,
  documents: string
) => {
  isLoaderShown.value = true;
  try {
    await charitiesStore.deleteCharity(
      id,
      displayPicture,
      coverPicture,
      documents
    );
    await initializeCharities();
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
    await charitiesStore.handleFeaturedCharity(id);
    await initializeCharities();
    isLoaderShown.value = false;
    toggleSnackbar("Feature action completed", true);
  } catch (error) {
    console.error(error);
    isLoaderShown.value = false;
    toggleSnackbar("Feature action failed. Please, try again.", true);
  }
};
const handleModify = async (id: string) => {
  router.push(`/menu/charities/modify-charity/${id}`);
};

const handleVerify = async (id: string) => {
  isLoaderShown.value = true;
  try {
    await charitiesStore.handleVerify(id);
    await initializeCharities();
    isLoaderShown.value = false;
    toggleSnackbar("Verify action completed", true);
  } catch (error) {
    console.error(error);
    isLoaderShown.value = false;
    toggleSnackbar("Verify action failed. Please, try again.", true);
  }
};
const toggleSnackbar = (text: string, value: boolean) => {
  isSnackbarShown.value = value;
  snackbarText.value = text;
  return;
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
            :disabled="!areCharitiesCreated || showFeatured || showOwned"
            density="compact"
            v-model="search"
            label="Search charities"
            hide-details
            variant="outlined"
            color="secondary"
          ></v-text-field>
        </v-col>
        <v-col
          v-if="canCreateCharities"
          cols="12"
          sm="4"
          md="4"
          lg="3"
          class="d-flex align-center justify-center"
        >
          <v-switch
            :disabled="!areCharitiesCreated"
            v-model="showOwned"
            hide-details
            label="Show own charities"
            color="warning"
          ></v-switch>
        </v-col>
        <v-col
          cols="12"
          sm="4"
          md="4"
          lg="3"
          class="d-flex align-center justify-center"
        >
          <v-switch
            :disabled="!areCharitiesCreated"
            v-model="showFeatured"
            hide-details
            label="Show featured"
            color="warning"
          ></v-switch>
        </v-col>
        <v-col
          v-if="canCreateCharities"
          cols="12"
          sm="4"
          md="4"
          lg="2"
          class="text-right d-flex align-center justify-start justify-sm-end"
        >
          <v-btn
            color="secondary"
            to="/menu/charities/add-charity"
            class="text-none"
            :disabled="usersStore.loggedInUser.role != 'admin' && areOwnCharitiesCreated"
          >
            <vue-feather
              type="plus"
              class="feather-sm mr-2"
              stroke="white"
            ></vue-feather>
            Add charity</v-btn
          >
        </v-col>
      </v-row>
      <v-table class="mt-5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Joining Date</th>
            <th v-if="canVerifyCharities">Verified</th>
            <th>Likes</th>
            <th>Views</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="isLoaderShown">
            <tr>
              <td colspan="7" class="pa-5 text-center">
                <v-progress-circular
                  indeterminate
                  color="secondary"
                ></v-progress-circular>
              </td>
            </tr>
          </template>
          <template v-else>
            <template v-if="areCharitiesCreated">
              <template v-if="isBeingSearched">
                <template v-if="areCharitiesFound"
                  ><tr v-for="charity in filteredList" :key="charity.id">
                    <CharityItem
                      :display-picture="charity.displayPicture"
                      :cover-picture="charity.coverPicture"
                      :documents="charity.documents"
                      :category="charity.category"
                      :createdBy="charity.createdBy"
                      :id="charity.id"
                      :is-featured="charity.isFeatured"
                      :is-verified="charity.isVerified"
                      :likes="charity.likes"
                      :short-description="charity.shortDescription"
                      :start-date="charity.startDate"
                      :title="charity.title"
                      :views="charity.views"
                      @handle-delete="handleDelete"
                      @handle-modify="handleModify"
                      @handle-featured="handleFeatured"
                      @handle-verify="handleVerify"
                    ></CharityItem></tr
                ></template>
                <template v-if="!areCharitiesFound">
                  <tr>
                    <td colspan="7" class="pa-5">
                      <h3 class="text-center text-grey">No charities found</h3>
                    </td>
                  </tr></template
                >
              </template>
              <template v-else-if="!showFeatured && !showOwned">
                <tr
                  v-for="charity in charitiesStore.charities"
                  :key="charity.id"
                >
                  <CharityItem
                    :display-picture="charity.displayPicture"
                    :cover-picture="charity.coverPicture"
                    :documents="charity.documents"
                    :category="charity.category"
                    :createdBy="charity.createdBy"
                    :id="charity.id"
                    :is-featured="charity.isFeatured"
                    :is-verified="charity.isVerified"
                    :likes="charity.likes"
                    :short-description="charity.shortDescription"
                    :start-date="charity.startDate"
                    :title="charity.title"
                    :views="charity.views"
                    @handle-delete="handleDelete"
                    @handle-modify="handleModify"
                    @handle-featured="handleFeatured"
                    @handle-verify="handleVerify"
                  ></CharityItem>
                </tr>
              </template>
              <template v-else-if="showFeatured">
                <template v-if="areCharitiesFeatured">
                  <tr
                    v-for="charity in charitiesStore.charities"
                    :key="charity.id"
                  >
                    <CharityItem
                      v-if="charity.isFeatured"
                      :display-picture="charity.displayPicture"
                      :cover-picture="charity.coverPicture"
                      :documents="charity.documents"
                      :category="charity.category"
                      :id="charity.id"
                      :createdBy="charity.createdBy"
                      :is-featured="charity.isFeatured"
                      :is-verified="charity.isVerified"
                      :likes="charity.likes"
                      :short-description="charity.shortDescription"
                      :start-date="charity.startDate"
                      :title="charity.title"
                      :views="charity.views"
                      @handle-delete="handleDelete"
                      @handle-modify="handleModify"
                      @handle-featured="handleFeatured"
                      @handle-verify="handleVerify"
                    ></CharityItem>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td colspan="7" class="pa-5">
                      <h3 class="text-center text-grey">
                        No charities featured
                      </h3>
                    </td>
                  </tr>
                </template>
              </template>
              <template v-else-if="showOwned">
                <template v-if="areOwnCharitiesCreated">
                  <tr v-for="charity in ownCharities" :key="charity.id">
                    <CharityItem
                      :display-picture="charity.displayPicture"
                      :cover-picture="charity.coverPicture"
                      :documents="charity.documents"
                      :category="charity.category"
                      :id="charity.id"
                      :createdBy="charity.createdBy"
                      :is-featured="charity.isFeatured"
                      :is-verified="charity.isVerified"
                      :likes="charity.likes"
                      :short-description="charity.shortDescription"
                      :start-date="charity.startDate"
                      :title="charity.title"
                      :views="charity.views"
                      @handle-delete="handleDelete"
                      @handle-modify="handleModify"
                      @handle-featured="handleFeatured"
                      @handle-verify="handleVerify"
                    ></CharityItem>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td colspan="7" class="pa-5">
                      <h3 class="text-center text-grey">No charities owned</h3>
                    </td>
                  </tr>
                </template>
              </template>
            </template>
            <template v-else>
              <tr>
                <td colspan="7" class="pa-5">
                  <h3 class="text-center text-grey">No charities created</h3>
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
