import { RouteRecordRaw } from "vue-router";

export const dashboardRoute: RouteRecordRaw[] = [
  {
    path: "index",
    name: "DashboardIndex",
    meta: {
      title: "首页",
      icon: "icon-dashboard",
    },
    component: () => import("./Index/index.vue"),
  },
  {
    path: "config",
    name: "DashboardConfig",
    meta: {
      title: "配置",
      icon: "icon-config",
    },
    component: () => import("./Config/index.vue"),
  },
  {
    path: "task",
    name: "DashboardTask",
    meta: {
      title: "我的任务",
      icon: "icon-upload",
    },
    component: () => import("./Task/index.vue"),
  },
];
