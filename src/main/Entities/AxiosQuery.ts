import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { convertBytes } from "@main/utils";

export class AxiosQuery {
  filename: string;
  url: string;
  dist: string = "./";
  constructor(filename: string, url: string, dist: string = "./") {
    this.filename = filename;
    this.url = url;
    this.dist = dist;
  }

  async download(cb) {
    const writer = fs.createWriteStream(path.join("./", this.filename));
    const { data, headers } = await axios.get(this.url, {
      responseType: "stream",
    });
    const totalLength = +headers["content-length"];
    const total = convertBytes(totalLength);
    let received = 0;
    data.on("data", (chunk) => {
      received += chunk.length;
      const percentage = ((received / totalLength) * 100).toFixed(0) + "%";
      cb(`${this.filename}: ${percentage} of ${total}`);
    });
    writer.on("error", (err) => {
      cb(null, err);
    });
    data.pipe(writer);
  }
}
