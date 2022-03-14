import { ImportJson, OpenedFolderData, UploadMedia } from "@common/dto";
import { defineStore } from "pinia";
import { EVENTS } from "@common/events";
import { ipcInstance } from "@render/plugins";
interface FileState {
  uploadMediaData: Nullable<UploadMediaData>;
  importData: Nullable<ImportData>;
  openedFolder: Nullable<OpenedFolder>;
  saveLoading: boolean;
}

export const useFileStore = defineStore({
  id: "file",
  state: (): FileState => {
    return {
      uploadMediaData: null,
      importData: null,
      openedFolder: null,
      saveLoading: false,
    };
  },
  actions: {
    // ipc
    // electron 打开媒体文件
    openFileDialog(id: string) {
      this.initUploadMediaData(id);
      ipcInstance.send(EVENTS.OPEN_FILE, id);
    },
    // 保存导出文件
    saveFileDialog(title: string, path: string, data: IObj) {
      ipcInstance.send(EVENTS.SAVE_FILE, {
        title,
        path,
        data,
      });
    },
    // 导入配置文件
    importFileDialog(id: string) {
      this.initImportData(id);
      ipcInstance.send(EVENTS.OPEN_IMPORT_FILE, id);
    },
    // 选择目录
    selectFolder(id: string) {
      this.initOpenedFolder(id);
      ipcInstance.send(EVENTS.OPEN_DIST_FOLDER, id);
    },
    // 初始化
    initUploadMediaData(id: string) {
      this.uploadMediaData = new UploadMedia({
        uploadId: id,
      });
    },
    initImportData(id: string) {
      this.importData = new ImportJson({
        id,
      });
    },
    initOpenedFolder(id: string) {
      this.importData = new OpenedFolderData({
        id,
      });
    },
    // 覆盖信息
    overrideUploadMediaData(data: UploadMediaData) {
      this.uploadMediaData = data;
    },
  },
});
