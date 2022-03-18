import Dexie from "dexie";

export class DashboardDatabase extends Dexie {
  configs!: Dexie.Table<IConfig, number>;
  tasks!: Dexie.Table<ITask, number>;

  constructor() {
    super("DashboardDatabase");
    this.version(5).stores({
      configs:
        "++id, updatedAt, ignoreError, abortOnError, dumpUserAgent, ignoreConfig, proxy, socketTimeout, dist",
      tasks:
        "++id, updatedAt, title, progress, webpage_url, thumbnail, duration, filesize, extractor, speed, eta, config",
    });
  }
}

export interface ICommon {
  id?: number; // Primary key. Optional (autoincremented)
  updatedAt: number;
}

export interface IConfig extends ICommon {
  ignoreError: boolean; //Continue on download errors, for  example to skip unavailable videos in a  playlist 继续处理下载错误，例如  例如，跳过某一视频列表中不可用的视频  播放列表
  abortOnError: boolean; // Abort downloading of further videos (in the playlist or the command line) if an error occurs 终止下载更多的视频（在 播放列表或命令行），如果出现 发生错误
  dumpUserAgent: boolean; // Display the current browser identification 显示当前的浏览器标识
  ignoreConfig: boolean; // Do not read configuration files. When given in the global configuration file /etc/youtube-dl.conf: Do not read the user configuration in ~/.config/youtube-dl/config (%APPDATA%/youtube-dl/config.txt on Windows) 不要读取配置文件。当在全局配置文件/etc/youtube-dl.conf中给出。不要读取~/.config/youtube-dl/config中的用户配置（Windows下为%APPDATA%/youtube-dl/config.txt）。
  proxy: string; //
  socketTimeout: number; // Time to wait before giving up, in  seconds 放弃前的等待时间，以秒为单位
  dist: string; //
}

export interface ITask extends ICommon {
  title: string;
  progress: number;
  webpage_url: string;
  thumbnail: string;
  duration: number;
  filesize: number;
  extractor: string;
  speed: string;
  eta: string;
  config: IConfig;
}

export const db = new DashboardDatabase();
