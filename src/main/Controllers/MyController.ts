import { Controller, IpcInvoke, IpcOn } from "../decorators";
import { MyService } from "../Services/MyService";
import { EVENTS } from "@common/events";
import { YtResponse, create as createYoutubeDl } from "youtube-dl-exec";
import { ImportJson, IpcResponseDTO, OpenedFolderData } from "@common/dto";
import { getAppDataPath, readFile, writeJson } from "@main/utils/fs";
import { FileService } from "@main/Services/FileService";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { shell } from "electron";
import { getDownloadInfo } from "@main/utils/youtube";
import { ITask } from "@common/types";
import { AxiosQuery } from "@main/Entities/AxiosQuery";
import { DownloadQuery } from "@main/Entities/DownloadQuery";
import { URL_GITHUB, URL_PREFIX, YOUTUBEDL_NAME } from "@main/utils/const";
// YOUTUBEDL

const youtubedl = createYoutubeDl(path.join(getAppDataPath(), YOUTUBEDL_NAME));
@Controller()
export class MyController {
  downloadQueryList: DownloadQuery[] = [];
  constructor(private myService: MyService, private fileService: FileService) {
    this.downloadQueryList = [];
  }

  @IpcOn(EVENTS.REPLY_EXEC_PRELOAD)
  public replyExecPreload(data: boolean = null, err = null) {
    return new IpcResponseDTO<boolean>(data, err);
  }

  @IpcOn(EVENTS.REPLY_EXEC_DOWNLOAD)
  public replyExecDownload(data: string = null, err = null) {
    return new IpcResponseDTO<string>(data, err);
  }

  @IpcOn(EVENTS.REPLY_SAVE_FILE)
  /**
   * `replySaveFile` is a function that takes a string and returns a string
   * @param {string} filepath - The path to the file that you want to save.
   * @returns The filepath.
   */
  public replySaveFile(filepath: string) {
    return filepath;
  }

  @IpcOn(EVENTS.REPLY_OPEN_IMPORT_FILE)
  /**
   * `replyOpenImportFile` is a function that takes a partial ImportData object and returns an
   * ImportJson object
   * @param data - Partial<ImportData>
   * @returns The ImportJson object.
   */
  public replyOpenImportFile(data: Partial<ImportData>) {
    const importData = new ImportJson(data);
    return importData;
  }

  @IpcOn(EVENTS.REPLY_OPEN_DIST_FOLDER)
  /**
   * `replyOpenDistFolder` is a function that takes a `Partial<OpenedFolder>` and returns an
   * `OpenedFolderData`
   * @param data - Partial<OpenedFolder>
   * @returns The `replyOpenDistFolder` method returns an `OpenedFolderData` object.
   */
  public replyOpenDistFolder(data: Partial<OpenedFolder>) {
    const openedFoler = new OpenedFolderData(data);
    return openedFoler;
  }

  @IpcOn(EVENTS.REPLY_DOWNLOAD_INFO)
  public replyDownloadInfo(data: YtResponse = null, err = null) {
    return new IpcResponseDTO<YtResponse>(data, err);
  }

  @IpcOn(EVENTS.REPLY_DOWNLOAD_FILE)
  public replyDownloadFile(data: ITask) {
    return data;
  }

  @IpcOn(EVENTS.REPLY_OPEN_FILE_IN_DIR)
  public replyOpenFileInDir(data: boolean = null, err = null) {
    return new IpcResponseDTO<boolean>(data, err);
  }

  @IpcOn(EVENTS.REPLY_EXEC_PAUSE)
  public replyExecPause(data: ITask = null, err = null) {
    return new IpcResponseDTO<ITask>(data, err);
  }

  @IpcInvoke(EVENTS.EXEC_PRELOAD)
  public async handleExecPreload() {
    try {
      await youtubedl("https://www.bilibili.com/video/BV1ea411h7X5/", {
        dumpJson: true,
      });
      this.replyExecPreload(true);
    } catch (err) {
      console.log(err);
      this.replyExecPreload(null, err.toString());
    }
  }

  @IpcInvoke(EVENTS.EXEC_DOWNLOAD)
  public async handleExecDownload() {
    const urlPrefix = URL_PREFIX + URL_GITHUB;
    const unix = YOUTUBEDL_NAME;
    const win = `${YOUTUBEDL_NAME}.exe`;
    const filename = os.platform() === "win32" ? win : unix;
    const url = os.platform() === "win32" ? urlPrefix + win : urlPrefix + unix;
    try {
      console.log(url);
      const axiosQuery = new AxiosQuery(filename, url);
      const filePath = await axiosQuery.download((data, err) => {
        this.replyExecDownload(data, err);
      });
      // 文件可执行
      /* This is a way to make the file executable. */
      fs.chmod(filePath, 0o755, (err) => {
        if (err) console.error(err);
        else {
          this.handleExecPreload();
        }
      });
    } catch (error) {
      console.log(error);
      this.replyExecDownload(null, error);
    }
  }

  @IpcInvoke(EVENTS.SAVE_FILE)
  public async handleSaveFile({
    title,
    path,
    data,
  }: {
    title: string;
    path: string;
    data: IObj;
  }) {
    this.fileService.onSaveFile(title, path).then((file) => {
      if (!file.canceled) {
        const filepath = file.filePath!.toString();
        // Creating and Writing to the sample.json file
        writeJson(filepath, data)
          .then(() => {
            this.replySaveFile(filepath);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }

  @IpcInvoke(EVENTS.OPEN_IMPORT_FILE)
  public async handleOpenImportFile(id: string) {
    try {
      const fileObj = await this.fileService.onOpenJsonFile();
      if (fileObj.canceled || fileObj.filePaths.length === 0) {
        this.replyOpenImportFile({
          id,
        });
      } else {
        const data = await readFile(fileObj.filePaths[0], {
          encoding: "utf-8",
        });
        this.replyOpenImportFile({
          id,
          data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  @IpcInvoke(EVENTS.OPEN_DIST_FOLDER)
  public async handleOpenDistFolder(id: string) {
    try {
      const folderObj = await this.fileService.onOpenFolder();
      // { canceled: false, filePaths: [ 'D:\\Downloads' ] }
      // console.log(folderObj);
      if (folderObj.canceled || folderObj.filePaths.length === 0) {
        this.replyOpenDistFolder({
          id,
        });
      } else {
        const path = folderObj.filePaths[0];
        this.replyOpenDistFolder({
          id,
          path,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  @IpcInvoke(EVENTS.DOWNLOAD_INFO)
  public async handleDownloadInfo(config: IObj) {
    try {
      const output = await getDownloadInfo(config);
      this.replyDownloadInfo(output);
    } catch (err) {
      console.log("download info err", err);
      this.replyDownloadInfo(null, err.toString());
    }
  }

  @IpcInvoke(EVENTS.DOWNLOAD_FILE)
  public async handleDownloadFile(row: ITask) {
    const downloadQuery = new DownloadQuery(
      row.id,
      row.webpage_url,
      row.title,
      "mp4",
      row.config
    );
    this.downloadQueryList.push(downloadQuery);
    downloadQuery.startProcess((data, err) => {
      if (data) {
        const task = { ...row, ...data };
        this.replyDownloadFile(task);
      } else {
        console.log(err);
      }
    });
  }

  @IpcInvoke(EVENTS.OPEN_FILE_IN_DIR)
  public handleOpenFileInDir(row: ITask) {
    if (!fs.existsSync(row.config.dist)) {
      this.replyOpenFileInDir(false, "无效文件");
      return;
    }
    shell.openExternal(row.config.dist);
  }

  @IpcInvoke(EVENTS.EXEC_PAUSE)
  public handlePauseDownload(row: ITask) {
    const downloadQuery = this.downloadQueryList.find(
      (item) => item.id === row.id
    );
    console.log(downloadQuery);
    if (downloadQuery) {
      const code = downloadQuery.stopProcess();
      // 暂停下载就移除队列
      this.downloadQueryList = this.downloadQueryList.filter(
        (item) => item.id !== row.id
      );
      if (code === 0) {
        this.replyExecPause(row);
      } else {
        this.replyExecPause(null, "暂停失败");
      }
    } else {
      this.replyExecPause(null, "暂停失败");
    }
  }
}
