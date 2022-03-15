import { promises } from "fs";

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
