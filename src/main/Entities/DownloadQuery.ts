import { ITask } from "@render/db";
import { ExecaChildProcess } from "execa";
import { YtResponse, create as createYoutubeDl } from "youtube-dl-exec";
import * as path from "path";
import * as fs from "fs";

// YOUTUBEDL
const youtubedl = createYoutubeDl(path.join("./", "youtube-dl"));

export class DownloadQuery {
  id: string;
  process: ExecaChildProcess<string>;
  url: string;
  title: string;
  config: IObj;
  stopped: boolean;
  constructor(id: string, url: string, title: string, config: IObj) {
    this.id = id;
    this.process = null;
    this.url = url;
    this.title = title;
    this.config = config;
    this.stopped = false;
  }

  stop() {
    this.stopped = true;
    if (this.process !== null) {
      this.process.cancel();
    }
  }

  start(cb) {
    if (this.stopped) return cb(null, "killed");
    this.process = youtubedl.exec(this.url, {
      output: path.join(this.config.dist, `${this.title}.mp4`),
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
        console.log("killed");
        cb(null, "killed");
      }
      console.log("done");
    });
  }
}
