import { dialog } from "electron";
import * as os from "os";
import * as path from "path";
import { Injectable } from "../decorators";
import { mainWindow } from "../index";

@Injectable("FileService")
export class FileService {
  static instance: any;
  constructor() {
    if (FileService.instance) {
      return FileService.instance;
    }
    FileService.instance = this;
  }

  public init() {
    this.onOpenFile();
    // this.onOpenFolder();
    // this.reg =
    //   /\.(MP4|WebM|Ogg|mkv|avi|MOV|ASF|WMV|NAVI|3GP|FLV|F4V|RMVB|HDDVD|rm|rmvb|mp3)$/i;
  }
  /**
   * It opens a file dialog and returns the path of the selected file.
   * @returns The file path of the selected file.
   */
  onOpenFile() {
    return dialog.showOpenDialog(mainWindow, {
      title: "打开文件",
      properties: ["openFile", "showHiddenFiles"],
      message: "打开媒体文件",
      filters: [
        {
          name: "media",
          extensions: [
            "MP4",
            "WebM",
            "Ogg",
            "mkv",
            "avi",
            "MOV",
            "ASF",
            "WMV",
            "NAVI",
            "3GP",
            "FLV",
            "F4V",
            "RMVB",
            "HDDVD",
            "rm",
            "rmvb",
            "MP3",
            "flac",
          ],
        },
      ],
    });
  }

  /**
   * It shows a save dialog box with the title and default path set.
   * @param {string} title - The title of the dialog window.
   * @param {string} filePath - The path to the file to be saved.
   * @returns The file path.
   */
  onSaveFile(title: string, filePath: string) {
    return dialog.showSaveDialog(mainWindow, {
      title,
      defaultPath: path.join(os.homedir(), filePath),
    });
  }

  /**
   * It opens a dialog box to select a JSON file to import.
   * @returns The dialog.showOpenDialog() method returns an array of file paths.
   */
  onOpenJsonFile() {
    return dialog.showOpenDialog(mainWindow, {
      title: "导入数据",
      properties: ["openFile", "showHiddenFiles"],
      message: "打开JSON",
      filters: [
        {
          name: "json",
          extensions: ["json"],
        },
      ],
    });
  }

  /**
   * It opens a dialog box that allows the user to select a folder.
   * @returns The dialog.showOpenDialog() method returns an array of file paths.
   */
  onOpenFolder() {
    return dialog.showOpenDialog(mainWindow, {
      title: "打开文件夹",
      properties: ["openDirectory"],
    });
  }
}

FileService.instance = null;
