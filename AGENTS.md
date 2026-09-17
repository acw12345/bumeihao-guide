# 项目说明

本项目是《不美好的一天》的本地与静态攻略站。当前代码维护以本目录 `bumeihao-guide` 为准，不再将旧的 `攻略站` 目录视为主要维护版本。

## 主要参考资料

整理、校对或更新攻略内容时，优先结合以下两份资料：

1. 腾讯文档天赋说明：
   <https://docs.qq.com/sheet/DU0VRWVpIVGJrS0p3?groupUin=FenUY%2BBf4QWYeFYAyGncaw%3D%3D&tab=2a4ik6>
2. 本地攻略表格：
   `E:\游戏攻略\不美好的每一天\不美好的一天神秘文本.xlsx`

腾讯文档主要用于核对天赋入口、卡片、前置条件、分支路线、进化和终端说明；本地 Excel 主要用于核对天赋与机体的评级、排序、占格、图片及作者整理的攻略评价。两份资料应结合使用，不应只依据其中一份推断完整路线。

如果资料之间存在冲突、原文条件不明确或图片不完整，应在攻略站中明确标注待确认内容，不要根据占格数、相邻卡片或名称相似度自行补齐路线。

## 代码维护位置

- 当前主要项目目录：`E:\游戏攻略\不美好的每一天\bumeihao-guide`
- 主要攻略数据：`app/combined-data.json`
- 图片和其他静态资源：`public/`
- GitHub Pages 构建配置：`.github/`、`vite.pages.config.ts`、`tsconfig.pages.json`

所有功能、数据和界面修改应优先落在 `bumeihao-guide` 中。修改前保留用户已有的未提交变更，不要用旧目录内容覆盖当前项目。

## 部署地址

生产页面：<https://acw12345.github.io/bumeihao-guide/>

该页面通过 GitHub Pages 发布。站点必须保持静态部署可用，资源路径需兼容 `/bumeihao-guide/` 子路径。提交前至少运行：

```sh
pnpm build
```

构建成功后再推送到配置的发布分支，由 GitHub Actions 更新生产页面。
