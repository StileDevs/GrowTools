import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/items-dat",
      name: "itemsdat",
      component: () => import("../views/items-dat/MainView.vue"),
    },
    {
      path: "/items-dat/:id",
      name: "itemsdat-detail",
      component: () => import("../views/items-dat/item-detail/DetailPage.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "notfound",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

router.beforeResolve((to, from, next) => {
  if (!document.startViewTransition) {
    next();
    return;
  }

  document.startViewTransition(() => {
    next();
  });
});

export default router;
