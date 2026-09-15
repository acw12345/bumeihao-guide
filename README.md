# 不美好的一天攻略站

React 静态攻略站，包含终端路线、天赋排行、机体排行与搜索。数据和图片随网站一起发布，不需要后台服务器或数据库。

## 发布到 GitHub Pages

推荐将本目录「攻略站」作为 GitHub 仓库根目录上传。保留 `.github`、`public`、`app`、配置文件与 `pnpm-lock.yaml`，不要上传 `node_modules`、`dist`、`dist-pages`、`.next`、`.vinext`、`.wrangler`、`.work` 或本地环境文件。

1. 在 GitHub 创建仓库，将攻略站源文件推送到 `main`（或 `master`）。
2. 进入仓库 **Settings → Pages → Build and deployment**，将 **Source** 设置为 **GitHub Actions**。
3. 在 **Actions** 打开 **Deploy guide to GitHub Pages**，点击 **Run workflow**。之后推送到 `main` 或 `master` 会自动更新网站。
4. 部署成功后，在 **Settings → Pages** 或工作流的 `github-pages` 环境中打开网站地址。

如果第一次推送时尚未开启 Pages 导致部署失败，完成第 2 步后手动重新运行即可。工作流只使用 GitHub 自带的令牌，不需要填写访问密钥。

也可以将父目录「不美好的每一天」作为仓库根目录：使用父目录的 `.github/workflows/deploy-pages.yml`，工作流会自动找到 `攻略站` 子目录。不要将其他不打算公开的文件上传。

网站使用相对资源路径，支持 `https://用户名.github.io/仓库名/` 和仓库首页部署。当前分类和路线切换在同一页面内完成。

## 本地使用

需要 Node.js 24 和 pnpm 11.19.0。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

打开终端显示的地址（通常为 `http://localhost:3000/`）。Windows 也可以在依赖已安装时双击 `启动攻略站.cmd`。

```sh
pnpm build
pnpm start
```

`build` 包含 TypeScript 检查，静态发布文件输出到 `dist-pages/`。`start` 用于预览构建结果；不要用双击 HTML 文件的方式预览。

## 原有 Sites 构建

原有 `vite.config.ts` 和 `.openai/hosting.json` 保留。需要原构建方式时使用 `pnpm dev:sites`、`pnpm build:sites`、`pnpm start:sites`。GitHub Pages 工作流只发布静态产物。

## 更新攻略

攻略数据在 `app/combined-data.json`，图片放在 `public/`。保持数据里的图片路径为 `/文件名`，静态入口会自动适配仓库路径。修改后推送源码即可重新部署。
