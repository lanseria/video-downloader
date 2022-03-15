import { CommonDTO } from "@common/dto";
import { IConfig, ITask } from "@render/db";
import { ConfigForm } from "../Config/Config.data";

/* A class that represents a task. */
export class TaskForm extends CommonDTO implements ITask {
  id?: number;
  updatedAt: number;
  name: string = "";
  progress: number = 0;
  urls: string[] = [];
  configs: IConfig = new ConfigForm();
}
