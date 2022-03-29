import { YtResponse, create as createYoutubeDl } from "youtube-dl-exec";
import * as path from "path";
import * as fs from "fs";

// YOUTUBEDL
const youtubedl = createYoutubeDl(path.join("./", "youtube-dl"));

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
      reject(err);
    });
    subprocess.stdout.on("close", () => {
      if (subprocess.killed) {
        console.log("killed");
        reject("killed");
      } else {
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
          .catch((err) => reject(err));
      })
      .catch((err) => reject(err));
  });
};
