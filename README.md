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

```bash
# install dependencies
pnpm i --frozen-lockfile

# run in developer mode
pnpm dev # npm run dev

# build
pnpm build # npm run build
```
