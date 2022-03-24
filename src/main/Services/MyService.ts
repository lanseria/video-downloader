import { Injectable } from "../decorators";
import { YtResponse, create as createYoutubeDl } from "youtube-dl-exec";
import * as path from "path";
import * as fs from "fs";
// YOUTUBEDL
const youtubedl = createYoutubeDl(path.join("./", "youtube-dl"));

@Injectable("MyService")
export class MyService {
  constructor() {
    // do nothing
  }

  public getDelayTime(): number {
    return 2;
  }

  public async getImage2Base64(
    imgUrl: string,
    config: IObj,
    row: YtResponse
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const output = path.join(config.dist, `${row.title}.jpg`);
      const subprocess = youtubedl.exec(imgUrl, {
        output,
        proxy: config.proxy || undefined,
      });
      console.log(`Running subprocess as ${subprocess.pid}`);
      subprocess.stdout.setEncoding("utf-8");
      subprocess.stdout.on("data", (data) => {
        const liveData = data.toString();
        console.log(liveData);
      });
      subprocess.stdout.on("error", (err) => {
        reject(err);
      });
      subprocess.stdout.on("close", () => {
        if (subprocess.killed) {
          console.log("killed");
          reject(reject);
        }
        let data = fs.readFileSync(output);
        console.log("done");
        resolve(`data:image/jpg;base64,${data.toString("base64")}`);
      });
    });
  }
}
