import { Controller, IpcInvoke, IpcOn } from "../decorators";
import { MyService } from "../Services/MyService";
import { EVENTS } from "@common/events";
import { YtResponse, create as createYoutubeDl } from "youtube-dl-exec";
import {
  ImportJson,
  IpcResponseDTO,
  OpenedFolderData,
  UploadMedia,
} from "@common/dto";
import { readFile, writeJson } from "@main/utils/fs";
import { FileService } from "@main/Services/FileService";
import { IConfig, ITask } from "@render/db";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import { convertBytes } from "@main/utils";
import { shell } from "electron";
// YOUTUBEDL
const youtubedl = createYoutubeDl(path.join("./", "youtube-dl"));
@Controller()
export class MyController {
  constructor(private myService: MyService, private fileService: FileService) {}

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

  @IpcInvoke(EVENTS.EXEC_PRELOAD)
  public async handleExecPreload() {
    try {
      await youtubedl("https://www.bilibili.com/video/BV1ea411h7X5/", {
        dumpJson: true,
      });
      this.replyExecPreload(true);
    } catch (err) {
      this.replyExecPreload(null, err.toString());
    }
  }

  @IpcInvoke(EVENTS.EXEC_DOWNLOAD)
  public async handleExecDownload() {
    const URL_PREFIX = "https://mirror.ghproxy.com/";
    const URL_GITHUB =
      "https://github.com/ytdl-org/youtube-dl/releases/download/2021.12.17/";
    const unix = "youtube-dl";
    const win = "youtube-dl.exe";
    const downloadToDist = async (filename: string) => {
      const writer = fs.createWriteStream(path.join("./", filename));
      const { data, headers } = await axios.get(
        URL_PREFIX + URL_GITHUB + filename,
        {
          responseType: "stream",
        }
      );
      const totalLength = +headers["content-length"];
      const total = convertBytes(totalLength);
      let received = 0;
      return await new Promise((resolve, reject) => {
        let error = null;
        data.on("data", (chunk) => {
          received += chunk.length;
          const percentage = ((received / totalLength) * 100).toFixed(0) + "%";
          this.replyExecDownload(`${filename}: ${percentage} of ${total}`);
        });
        writer.on("error", (err) => {
          error = err;
          reject(err);
        });
        writer.on("close", async () => {
          if (!error) {
            resolve(true);
          }
        });
        data.pipe(writer);
      });
    };
    try {
      await downloadToDist(unix);
      await downloadToDist(win);
      await this.handleExecPreload();
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
    const proxy = config.proxy || undefined;
    youtubedl(config.url, {
      dumpSingleJson: true,
      proxy,
    })
      .then(async (output) => {
        const base = await this.myService.getImage2Base64(
          output.thumbnail,
          config,
          output
        );
        output.thumbnail = base;
        this.replyDownloadInfo(output);
      })
      .catch((err) => {
        console.log(err);
        this.replyDownloadInfo(null, err.toString());
      });
  }

  @IpcInvoke(EVENTS.DOWNLOAD_FILE)
  public async handleDownloadFile(row: ITask) {
    const subprocess = youtubedl.exec(row.webpage_url, {
      output: path.join(row.config.dist, `${row.title}.mp4`),
      proxy: row.config.proxy || undefined,
    });
    console.log(`Running subprocess as ${subprocess.pid}`);
    subprocess.stdout.setEncoding("utf-8");
    subprocess.stdout.on("data", (data) => {
      const liveData = data.toString();
      if (!liveData.includes("[download]")) return;

      let liveDataArray = liveData.split(" ").filter((el) => {
        return el !== "";
      });
      if (liveDataArray.length > 10) return;
      liveDataArray = liveDataArray.filter((el) => {
        return el !== "\n";
      });
      let percentage: string = liveDataArray[1];
      let speed: string = liveDataArray[5];
      let eta: string = liveDataArray[7];
      if (percentage === "100%") {
      } else {
        // console.log(percentage, speed, eta);
        this.replyDownloadFile({
          ...row,
          progress: +percentage.split("%")[0],
          speed,
          eta,
        });
      }
    });

    subprocess.stdout.on("close", () => {
      if (subprocess.killed) {
        console.log("killed");
      }
      console.log("done");
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
}
