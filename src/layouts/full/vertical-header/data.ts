const items = [
  {
    color: "warning",
    icon: "settings",
    title: "Settings",
    desc: "Manage your account",
    to: "/settings",
    logout: false,
  },
  {
    color: "secondary",
    icon: "log-out",
    title: "Logout",
    desc: "Exit from your account",
    to: "/authentication/fulllogin",
    logout: true,
  },
];

export { items };
