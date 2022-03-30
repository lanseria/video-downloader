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

// 重新进入后，任务全部暂停
db.transaction("rw", db.tasks, async () => {
  // Transaction Scope
  db.tasks.each((task) => {
    db.tasks
      .update(task.id, {
        pending: true,
      })
      .then((updated) => {
        if (updated) {
          console.log("Task updated");
        } else {
          console.log("Task not updated");
        }
      });
  });
})
  .then(() => {
    // Transaction Complete
    console.log("Transaction committed");
  })
  .catch((err) => {
    // Transaction Failed
    console.error(err.stack);
  });
