import * as fs from "fs";
import * as path from "path";
import axios, { HeadersDefaults } from "axios";
import { convertBytes } from "@main/utils";
import { Stream } from "stream";

export class AxiosQuery {
  filename: string;
  url: string;
  dist: string = "./";
  constructor(filename: string, url: string, dist: string = "./") {
    this.filename = filename;
    this.url = url;
    this.dist = dist;
  }

  download(cb): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const filePath = path.join(this.dist, this.filename);
      const writer = fs.createWriteStream(filePath);
      const { data, headers } = await axios.get<{
        data: Stream;
        headers: HeadersDefaults;
      }>(this.url, {
        responseType: "stream",
      });
      const totalLength = +headers["content-length"];
      const total = convertBytes(totalLength);
      let received = 0;
      data.pipe(writer);
      data.on("data", (chunk) => {
        received += chunk.length;
        const percentage = ((received / totalLength) * 100).toFixed(0) + "%";
        cb(`${this.filename}: ${percentage} of ${total}`);
      });
      data.on("end", () => {
        console.log(filePath, "download complete");
      });
      writer.on("error", (err) => {
        reject(err);
      });
      writer.on("finish", () => {
        console.log(filePath, "download finished");
        resolve(filePath);
      });
    });
  }
}
