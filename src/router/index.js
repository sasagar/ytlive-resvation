import { createRouter, createWebHistory } from "vue-router";
import Loading from "../views/Loading.vue";

const routes = [
  {
    path: "/",
    name: "Loading",
    component: Loading,
  },
  {
    path: "/livelist",
    name: "LiveList",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/LiveList.vue"),
  },
  {
    path: "/dashboard/:id",
    name: "LiveDashboard",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/LiveDashboard.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
