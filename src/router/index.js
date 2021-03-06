import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import Loading from "../views/Loading.vue";
import Display from "../views/Display.vue";
import Secret from "../views/Secret.vue";
import GoogleAuth from "../views/GoogleAuth.vue";

const routes = [
  {
    path: "/display",
    name: "Display",
    component: Display,
  },
  {
    path: "/secret",
    name: "Secret",
    component: Secret,
  },
  {
    path: "/googleauth",
    name: "GoogleAuth",
    component: GoogleAuth,
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
  {
    path: "/",
    name: "Loading",
    component: Loading,
  },
];

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: process.env.IS_ELECTRON
    ? createWebHashHistory()
    : createWebHistory(),
  routes,
});

export default router;
