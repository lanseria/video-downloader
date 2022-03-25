# Video Downloader

使用 vitejs + vue + electron 17 打造的视频下载工具

## 使用视频

https://www.bilibili.com/video/BV1vq4y1v7by/

## 截图

![](./docs/task.png)

## Feature

- [x] 视频下载
- [x] 可执行文件检查与下载(现在只能 windows 上使用)
  - [ ] unix 系统可执行文件权限限制
- [x] 代理下载
  - [x] 图片封面代理
- [x] 进度条
- [ ] 多线程下载

## How to use

- Click the [Use this template](https://github.com/ArcherGu/fast-vite-electron/generate) button (you must be logged in) or just clone this repo.
- In the project folder:

  ```bash
  # install dependencies
  pnpm i --frozen-lockfile

  # run in developer mode
  yarn dev # npm run dev

  # build
  yarn build # npm run build
  ```
