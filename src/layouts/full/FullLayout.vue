<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import VerticalSidebarVue from "./vertical-sidebar/VerticalSidebar.vue";
import VerticalHeaderVue from "./vertical-header/VerticalHeader.vue";
import { useCustomizerStore } from "@/stores/customizer";
import { useUsers } from "@/stores/users";
import { useRouter } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

const customizer = useCustomizerStore();

// <-- Lifecycle Hooks -->
onMounted(() => {
  isUserLoggedIn();
});

// <-- Variables -->
const usersStore = useUsers();
const router = useRouter();

// <-- Functions -->
const isUserLoggedIn = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      usersStore.assignLoggedUserValues(user);
    } else {
      router.push("/authentication/fulllogin");
    }
  });
};
</script>

<template>
  <v-app
    :theme="customizer.darktheme ? 'dark' : 'light'"
    :class="[customizer.mini_sidebar ? 'mini-sidebar' : '']"
  >
    <VerticalSidebarVue />
    <VerticalHeaderVue />
    <v-main>
      <v-container fluid class="page-wrapper">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>
