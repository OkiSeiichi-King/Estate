import { createRouter, createWebHashHistory } from "vue-router";

import access from "@/middleware/access.js";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/Home.vue"),
      meta: {
        access: {
          permissions: ["CHAIN_CORRECT"],
        },
      },
    },
    {
      path: "/items",
      name: "Items",
      component: () => import("@/views/Items.vue"),
      meta: {
        access: {
          permissions: ["CHAIN_CORRECT"],
        },
      },
    },
    {
      path: "/ethereum",
      name: "Network",
      component: () => import("@/views/Network.vue"),
      meta: {
        access: {
          permissions: ["CHAIN_INCORRECT"],
        },
      },
    },
    {
      path: "/estates/:id",
      name: "Token",
      component: () => import("@/views/Token.vue"),
      meta: {
        access: {
          permissions: ["CHAIN_CORRECT"],
        },
      },
    },
  ],
});

router.beforeEach(access);

export default router;
