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

## standard-version

默认情况下，工具会自动根据 主版本`major`，次版本`minor` or 修订版`patch`。 规则生成版本号，例如如果你 `package.json` 中的 `version` 为 `1.0.0`, 那么执行后版本号则是：`1.0.1`。自定义可以通过：

```bash
$ standard-version -r major
$ standard-version -r minor
$ standard-version -r patch
# output 1.1.0
$ standard-version -r 2.0.0
# output 2.0.0
$ standard-version -r 2.0.0-test
# output 2.0.0-test
```

--prerelease, -p 预发版本命名
用来生成预发版本, 如果当期的版本号是 2.0.0，例如

```bash

$ standard-version --prerelease alpha

# output 2.0.0-alpha.0

--tag-prefix, -t 版本 tag 前缀
用来给生成 tag 标签添加前缀，例如如果前版本号为 2.0.0，则：

$ standard-version --tag-prefix "stable-"

# output tag: stable-v2.0.0
```

以上这几个参数可能我们用的比较多，还有其他选项可以通过 standard-version --help 查看。
