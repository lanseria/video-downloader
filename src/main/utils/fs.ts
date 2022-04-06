import { promises } from "fs";
import * as path from "path";
import { name as AppName } from "../../../package.json";

export const writeFile = promises.writeFile;
export const readFile = promises.readFile;

/**
 * It writes a JSON file to the file system.
 * @param {string} filepath - The path to the file you want to write to.
 * @param {IObj} data - The data to write to the file.
 */
export const writeJson = async (filepath: string, data: IObj) => {
  try {
    await promises.writeFile(filepath, JSON.stringify(data, null, 2), {});
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getAppDataPath = () => {
  switch (process.platform) {
    case "darwin": {
      return path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        AppName
      );
    }
    case "win32": {
      return path.join(process.env.APPDATA, AppName);
    }
    case "linux": {
      return path.join(process.env.HOME, `.${AppName}`);
    }
    default: {
      console.log("Unsupported platform!");
      process.exit(1);
    }
  }
};
