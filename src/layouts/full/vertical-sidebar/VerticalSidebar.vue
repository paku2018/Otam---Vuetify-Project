<script setup lang="ts">
import { ref, computed } from "vue";
import { useCustomizerStore } from "@/stores/customizer";
import sidebarItems from "./sidebarItem";
import { useUsers } from "@/stores/users";

// <-- Stores -->
const customizer = useCustomizerStore();
const usersStore = useUsers();

// <-- Variables -->
const sidebarMenu = ref(sidebarItems);

// <-- Computed -->
const canCreateUsers = computed(
  () => usersStore.loggedInUser.privileges["add-users"]
);
const canModifyUsers = computed(
  () => usersStore.loggedInUser.privileges["modify-users"]
);
const canDeleteUsers = computed(
  () => usersStore.loggedInUser.privileges["delete-users"]
);
</script>

<template>
  <v-navigation-drawer
    left
    :permanent="$vuetify.display.mdAndUp"
    v-model="customizer.Sidebar_drawer"
    elevation="10"
    :class="customizer.SidebarColor == 'white' ? '' : 'text-white'"
    :color="customizer.darktheme ? '' : customizer.SidebarColor"
    rail-width="75.8"
    mobile-breakpoint="960"
    app
    :rail="customizer.mini_sidebar"
    expand-on-hover
  >
    <!-- ---------------------------------------------- -->
    <!---Logo part -->
    <!-- ---------------------------------------------- -->
    <div class="pa-4">
      <img src="/assets/images/logo/atmabest-logo.png" />
    </div>
    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <perfect-scrollbar class="scrollnavbar">
      <v-list class="pa-4" color="transparent">
        <!-- ---------------------------------------------- -->
        <!---Menu Loop -->
        <!-- ---------------------------------------------- -->
        <template v-for="item in sidebarMenu">
          <!-- ---------------------------------------------- -->
          <!---Item Sub Header -->
          <!-- ---------------------------------------------- -->
          <v-list-subheader v-if="item.header" :key="item.header">{{
            item.header
          }}</v-list-subheader>
          <!-- ---------------------------------------------- -->
          <!---Single Item-->
          <!-- ---------------------------------------------- -->
          <template v-else>
            <v-list-item
              v-if="
                item.availableFor?.includes(usersStore.loggedInUser.role) ||
                canCreateUsers ||
                canModifyUsers ||
                canDeleteUsers
              "
              :key="item.title"
              :to="item.to"
              rounded="lg"
              class="mb-1"
            >
              <v-list-item-avatar start class="v-list-item-avatar--start">
                <vue-feather
                  :type="item.icon"
                  class="feather-sm v-icon v-icon--size-default"
                ></vue-feather>
              </v-list-item-avatar>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item>
          </template>
          <!-- ---------------------------------------------- -->
          <!---End Single Item-->
          <!-- ---------------------------------------------- -->
        </template>
      </v-list>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>
