import { Controller, IpcInvoke, IpcOn } from "../decorators";
import { MyService } from "../Services/MyService";
import { EVENTS } from "@common/events";
import youtubedl, { YtResponse, exec } from "youtube-dl-exec";
import { ImportJson, OpenedFolderData, UploadMedia } from "@common/dto";
import { readFile, writeJson } from "@main/utils/fs";
import { FileService } from "@main/Services/FileService";
import { ITask } from "@render/db";
import * as path from "path";
@Controller()
export class MyController {
  constructor(private myService: MyService, private fileService: FileService) {}

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
  public replyDownloadInfo(data: YtResponse) {
    return data;
  }

  @IpcOn(EVENTS.REPLY_DOWNLOAD_FILE)
  public replyDownloadFile(data: ITask) {
    return data;
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
  public async handleDownloadInfo(url: string) {
    youtubedl(url, {
      dumpSingleJson: true,
    })
      .then((output) => this.replyDownloadInfo(output))
      .catch((err) => console.log(err));
  }

  @IpcInvoke(EVENTS.DOWNLOAD_FILE)
  public async handleDownloadFile(row: ITask) {
    console.log(row);
    const subprocess = exec(row.webpage_url, {
      output: path.join(row.config.dist, `${row.title}.mp4`),
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
        console.log(percentage, speed, eta);
        this.replyDownloadFile({
          ...row,
          progress: +percentage.split("%")[0],
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
}
