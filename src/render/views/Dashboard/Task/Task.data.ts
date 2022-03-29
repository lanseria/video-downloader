import { CommonDTO } from "@common/dto";
import { IConfig, ITask } from "@common/types";
import { ConfigForm } from "../Config/Config.data";

/* A class that represents a task. */
export class TaskForm extends CommonDTO implements ITask {
  id?: number;
  updatedAt: number;
  title: string = "";
  progress: number = 0;
  webpage_url: string = "";
  thumbnail: string = "https://dummyimage.com/200x120/333333/FFF&text=No-Image";
  duration: number = 0;
  filesize: number = 0;
  extractor: string = "";
  speed: string = "";
  eta: string = "";
  pending = false;
  config: IConfig = new ConfigForm();
}
