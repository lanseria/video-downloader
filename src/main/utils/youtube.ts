import { YtResponse, create as createYoutubeDl } from "youtube-dl-exec";
import * as path from "path";
import * as fs from "fs";
import { YOUTUBEDL_NAME } from "./const";

// YOUTUBEDL
const youtubedl = createYoutubeDl(path.join("./", YOUTUBEDL_NAME));

/**
 * Download a jpg from a url and save it to a specified location
 * @param {string} url - The URL of the video to download.
 * @param {IObj} config - IObj
 * @param {string} title - The title of the video.
 * @returns The path to the downloaded file.
 */
export const downloadJpgToDist = (
  url: string,
  config: IObj,
  title: string
): Promise<string> => {
  const output = path.join(config.dist, `${title}.jpg`);
  // https://www.bilibili.com/video/BV1rY411J7s4?spm_id_from=333.851.b_7265636f6d6d656e64.1
  const subprocess = youtubedl.exec(url, {
    output,
    proxy: config.proxy || undefined,
  });
  console.log(`Running subprocess as ${subprocess.pid}`);
  subprocess.stdout.setEncoding("utf-8");
  return new Promise((resolve, reject) => {
    subprocess.stdout.on("data", (data) => {
      const liveData = data.toString();
      console.log(liveData);
    });
    subprocess.stdout.on("error", (err) => {
      console.log(err);
      reject(err);
    });
    subprocess.stdout.on("end", () => {
      console.log("jpg end");
    });
    subprocess.stdout.on("close", () => {
      if (subprocess.killed) {
        reject("jpg killed");
      } else {
        console.log(output);
        resolve(output);
      }
    });
  });
};

/**
 * It takes a path to a file and returns a promise that resolves to a base64 encoded string.
 * @param {string} path - The path to the image file.
 * @returns The image is being returned as a base64 encoded string.
 */
export const distJpgToBase64 = (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path,
      {
        encoding: "base64",
      },
      (err, data) => {
        if (err) {
          console.log("jpg to base64 error: ", err);
          reject(err);
        }
        resolve(`data:image/jpg;base64,${data}`);
      }
    );
  });
};

/**
 * Download a jpg from a url, convert it to a base64 string, and return it
 * @param {string} url - The URL of the image to download.
 * @param {IObj} config - IObj
 * @param {string} title - The title of the image.
 * @returns A promise that resolves to a base64 string.
 */
export const jpgUrl2Base64 = async (
  url: string,
  config: IObj,
  title: string
): Promise<string> => {
  const output = await downloadJpgToDist(url, config, title);
  return distJpgToBase64(output);
};

const _proxy = (proxy: string | undefined) => {
  return proxy || undefined;
};
// Error: ENOENT: no such file or directory, open '/Users/zhangchao/Downloads/求求 快来个人把她毒哑吧.jpg'
export const getDownloadInfo = (config: IObj): Promise<YtResponse> => {
  const proxy = _proxy(config.proxy);
  return new Promise((resolve, reject) => {
    youtubedl(config.url, {
      dumpSingleJson: true,
      proxy,
    })
      .then((output) => {
        jpgUrl2Base64(output.thumbnail, config, output.title)
          .then((base64) => {
            output.thumbnail = base64;
            resolve(output);
          })
          .catch((err) => {
            console.log("jpgUrl2Base64 err", err);
            reject(err);
          });
      })
      .catch((err) => {
        console.log("video info err", err);
        reject(err);
      });
  });
};
