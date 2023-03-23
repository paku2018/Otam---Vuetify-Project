export default [
  {
    title: "Dashboard",
    icon: "grid",
    to: "/dashboard/",
    availableFor: ["admin", "super", "simple"],
  },
  { header: "Menu" },
  {
    title: "Advertisements",
    icon: "bookmark",
    to: "/menu/advertisements",
    availableFor: ["admin"],
  },
  {
    title: "Charities",
    icon: "home",
    to: "/menu/charities",
    availableFor: ["admin", "super", "simple"],
  },
  {
    title: "Connecting",
    icon: "folder-plus",
    to: "/menu/connections",
    availableFor: ["admin", "super", "simple"],
  },
  {
    title: "Contents",
    icon: "book",
    to: "/menu/contents",
    availableFor: ["admin", "super", "simple"],
  },
  {
    title: "Users",
    icon: "users",
    to: "/menu/users",
    availableFor: ["admin"],
  },
];
