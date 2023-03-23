import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  //history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory("/"),
  routes: [
    {
      path: "/",
      redirect: "/dashboard/",
      component: () => import("@/layouts/full/FullLayout.vue"),
      children: [
        {
          name: "Dashboard",
          path: "/dashboard/",
          component: () => import("@/views/dashboard/Dashboard.vue"),
        },
        {
          name: "Charity List",
          path: "/menu/charities",
          component: () => import("@/views/menu/charities/CharitiesList.vue"),
        },
        {
          name: "Add Charity",
          path: "/menu/charities/add-charity",
          component: () =>
            import("@/views/menu/charities/add-charity/AddCharity.vue"),
        },
        {
          name: "Modify Charity",
          path: "/menu/charities/modify-charity/:id",
          component: () =>
            import("@/views/menu/charities/modify-charity/ModifyCharity.vue"),
        },
        {
          name: "Advertisements List",
          path: "/menu/advertisements",
          component: () =>
            import("@/views/menu/advertisements/AdvertisementsList.vue"),
        },
        {
          name: "Add Advertisement",
          path: "/menu/advertisements/add-advertisement",
          component: () =>
            import(
              "@/views/menu/advertisements/add-advertisement/AddAdvertisement.vue"
            ),
        },
        {
          name: "Modify Advertisement",
          path: "/menu/advertisements/modify-advertisement/:id",
          component: () =>
            import(
              "@/views/menu/advertisements/modify-advertisement/ModifyAdvertisement.vue"
            ),
        },
        {
          name: "Content List",
          path: "/menu/contents",
          component: () => import("@/views/menu/contents/ContentsList.vue"),
        },
        {
          name: "Add Content",
          path: "/menu/contents/add-content",
          component: () =>
            import("@/views/menu/contents/add-content/AddContent.vue"),
        },
        {
          name: "Modify Content",
          path: "/menu/contents/modify-content/:category/:id",
          component: () =>
            import("@/views/menu/contents/modify-content/ModifyContent.vue"),
        },
        {
          name: "Users",
          path: "/menu/users",
          component: () => import("@/views/menu/users/UserList.vue"),
        },
        {
          name: "Add User",
          path: "/menu/users/add-user",
          component: () => import("@/views/menu/users/add-user/AddUser.vue"),
        },
        {
          name: "Modify User",
          path: "/menu/users/modify-user/:id",
          component: () =>
            import("@/views/menu/users/modify-user/ModifyUser.vue"),
        },
        {
          name: "Connections",
          path: "/menu/connections",
          component: () =>
            import("@/views/menu/connections/ConnectionsList.vue"),
        },
        {
          name: "Add Connection",
          path: "/menu/connections/add-connection",
          component: () =>
            import("@/views/menu/connections/add-connection/AddConnection.vue"),
        },
        {
          name: "Modify Connection",
          path: "/menu/connections/modify-connection/:type/:id",
          component: () =>
            import(
              "@/views/menu/connections/modify-connection/ModifyConnection.vue"
            ),
        },
        {
          name: "Modify Account",
          path: "/settings",
          component: () => import("@/views/settings/SettingsPage.vue"),
        },
      ],
    },
    {
      path: "/authentication",
      component: () => import("@/layouts/blank/BlankLayout.vue"),
      children: [
        {
          name: "Login",
          path: "/authentication/fulllogin",
          component: () => import("@/views/authentication/FullLogin.vue"),
        },
      ],
    },
  ],
});

export default router;
