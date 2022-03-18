import { CommonDTO } from "@common/dto";
import { IConfig, ITask } from "@render/db";
import { ConfigForm } from "../Config/Config.data";

/* A class that represents a task. */
export class TaskForm extends CommonDTO implements ITask {
  id?: number;
  updatedAt: number;
  title: string = "";
  progress: number = 0;
  webpage_url: string = "";
  thumbnail: string = "";
  config: IConfig = new ConfigForm();
}
