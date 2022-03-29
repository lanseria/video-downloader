import { IConfig, ITask } from "@common/types";
import Dexie from "dexie";

export class DashboardDatabase extends Dexie {
  configs!: Dexie.Table<IConfig, number>;
  tasks!: Dexie.Table<ITask, number>;

  constructor() {
    super("DashboardDatabase");
    this.version(6).stores({
      configs:
        "++id, updatedAt, ignoreError, abortOnError, dumpUserAgent, ignoreConfig, proxy, socketTimeout, dist",
      tasks:
        "++id, updatedAt, title, progress, webpage_url, thumbnail, duration, filesize, extractor, speed, eta, pending, config",
    });
  }
}

export const db = new DashboardDatabase();
