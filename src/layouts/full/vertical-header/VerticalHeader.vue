<template>
  <v-app-bar
    class="d-flex justify-center align-center"
    elevation="0"
    :priority="priority"
    color="atmabest"
  >
    <v-app-bar-nav-icon
      color="white"
      class="hidden-sm-and-down"
      @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)"
    />
    <v-app-bar-nav-icon
      class="hidden-md-and-up"
      @click.stop="customizer.SET_SIDEBAR_DRAWER"
    />
    <v-spacer />
    <!-- ---------------------------------------------- -->
    <!---right part -->
    <!-- ---------------------------------------------- -->

    <v-menu anchor="bottom end" origin="auto">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" color="white" size="x-large">
          <v-img
            :src="userImage"
            width="45px"
            class="rounded-circle img-fluid mr-2"
          ></v-img>
          <span class="text-body-1">{{
            usersStore.loggedInUser.displayName
          }}</span>
        </v-btn>
      </template>

      <v-list class="pa-6" elevation="10" rounded="lg" max-width="300">
        <h4 class="d-flex">Menu</h4>
        <v-list-item
          class="pa-3 mt-2"
          v-for="item in items"
          :key="item.title"
          :value="item"
          rounded="lg"
          :title="item.title"
          :subtitle="item.desc"
          :to="item.to"
          @click.stop="handleLogout(item.logout)"
        >
          <template v-slot:prepend>
            <v-list-item-avatar start>
              <v-btn
                :color="item.color"
                icon
                variant="contained"
                elevation="0"
                class="mr-3"
              >
                <vue-feather :type="item.icon" size="18"></vue-feather>
              </v-btn>
            </v-list-item-avatar>
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useCustomizerStore } from "../../../stores/customizer";
import { items } from "./data";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useUsers } from "@/stores/users";
import { useCharities } from "@/stores/charities";
import { useAdvertisements } from "@/stores/advertisements";

// <-- Stores -->
const customizer = useCustomizerStore();
const usersStore = useUsers();
const charitiesStore = useCharities();
const advertisementsStore = useAdvertisements();

// <-- Variables -->
const priority = ref(customizer.setHorizontalLayout ? 0 : 0);
watch(priority, (newPriority) => {
  // yes, console.log() is a side effect
  priority.value = newPriority;
});

// <-- Functions -->
const handleLogout = async (logout: boolean) => {
  if (!logout) {
    return;
  }
  usersStore.handleLogout();
  charitiesStore.handleLogout();
  advertisementsStore.handleLogout();
  await signOut(auth)
    .then(() => {
      // Sign out successful
    })
    .catch((error) => {
      // An error happened.
    });
};

// <-- Computed -->
const userImage = computed(() =>
  usersStore.loggedInUser.photoURL === ""
    ? "/assets/images/users/2.jpg"
    : usersStore.loggedInUser.photoURL
);
</script>
