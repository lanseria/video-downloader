import { defineStore } from "pinia";

interface DownloadState {}

export const useDownloadStore = defineStore({
  id: "download",
  state: (): DownloadState => {
    return {};
  },
  actions: {},
});
