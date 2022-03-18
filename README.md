# Video Downloader

使用 vitejs + vue + electron 17 打造的视频下载工具

## Feature

- [x] 视频下载
- [x] 可执行文件检查与下载
  - [ ] unix 系统可执行文件权限限制
- [x] 代理下载
  - [ ] 图片封面代理
- [x] 进度条
- [ ] 多线程下载

**NOTE:** Main process is built with esbuild. After some modifications, it currently supports [`emitDecoratorMetadata`](https://www.typescriptlang.org/tsconfig#emitDecoratorMetadata).

## Motivation

In the past, I've been building desktop clients with [vue](https://v3.vuejs.org/) + [vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder), and they work very well. But as the project volume grows, webpack-based build patterns become slower and slower.

The advent of [vite](https://vitejs.dev/) and [esbuild](https://esbuild.github.io/) greatly improved the development experience and made me feel lightning fast ⚡.

It took me a little time to extract this template and thank you for using it.

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

## Relative

My blog post:

- [极速 DX Vite + Electron + esbuild](https://archergu.me/posts/vite-electron-esbuild)
- [用装饰器给 Electron 提供一个基础 API 框架](https://archergu.me/posts/electron-decorators)
