import { ExecaChildProcess } from "execa";
import { YtResponse, create as createYoutubeDl } from "youtube-dl-exec";
import * as path from "path";
import * as fs from "fs";
import { YOUTUBEDL_NAME } from "@main/utils/const";

// YOUTUBEDL
const youtubedl = createYoutubeDl(path.join("./", YOUTUBEDL_NAME));

export class DownloadQuery {
  id: string;
  // 进程
  process: ExecaChildProcess<string>;
  // 下载地址
  url: string;
  // 文件名
  title: string;
  // 后缀名
  ext: string;
  // youtube-dl-exec 配置
  config: IObj;
  // 是否已经停止
  stopped: boolean;
  // 初始化
  constructor(
    id: string,
    url: string,
    title: string,
    ext: string,
    config: IObj
  ) {
    this.id = id;
    this.process = null;
    this.url = url;
    this.title = title;
    this.ext = ext;
    this.config = config;
    this.stopped = false;
  }
  // 停止
  stopProcess() {
    this.stopped = true;
    if (this.process !== null) {
      this.process.cancel();
      return 0;
    } else {
      console.log("process is null");
      return 1;
    }
  }
  // 下载
  startProcess(cb) {
    if (this.stopped) return cb(null, "killed");
    this.process = youtubedl.exec(this.url, {
      output: path.join(this.config.dist, `${this.title}.${this.ext}`),
      proxy: this.config.proxy || undefined,
    });
    console.log(`Running subprocess as ${this.process.pid}`);
    this.process.stdout.setEncoding("utf-8");
    this.process.stdout.on("data", (data) => {
      const liveData = data.toString();
      console.log(liveData);
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
        cb({
          id: this.id,
          progress: +percentage.split("%")[0],
          speed,
          eta,
        });
      }
    });

    this.process.stdout.on("close", () => {
      if (this.process.killed) {
        console.log("download killed");
        cb(null, "killed");
      }
      console.log("done");
    });
  }
}
