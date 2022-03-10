import { RouteRecordRaw } from "vue-router";
import Layout from "../views/layouts/index.vue";
import Welcome from "../views/Welcome/index.vue";
import DashboardLayout from "../views/layouts/Dashboard.vue";
import { dashboardRoute } from "@render/views/Dashboard/route";

export const basicRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "首页",
    redirect: "/welcome",
    component: Layout,
    children: [
      {
        path: "welcome",
        name: "欢迎页",
        component: Welcome,
      },
      {
        path: "dashboard",
        name: "工作台",
        redirect: "/dashboard/index",
        component: DashboardLayout,
        children: [...dashboardRoute],
      },
    ],
  },
];
