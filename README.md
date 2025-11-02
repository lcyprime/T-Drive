# T-Drive Web (Cloudflare + Telegram)

一个可部署在 Cloudflare 的简易网页版网盘，使用 Telegram 存储文件。

## ✨ 功能
- 登录 + API Key 验证
- 文件上传、浏览、缩略图预览
- Telegram 存储文件
- Cloudflare Workers + KV 缓存缩略图

## 🚀 部署步骤

### 1. 上传到 GitHub
- 创建一个仓库 `t-drive-web`
- 上传所有文件

### 2. 创建 Cloudflare Worker
- 创建 Worker
- 在 KV 中建立两个命名空间：`t-drive-db` 和 `t-drive-thumb`
- 在 Worker 绑定：
  - `DB` → `t-drive-db`
  - `THUMB_CACHE` → `t-drive-thumb`

### 3. 添加 Secrets
```
TELEGRAM_BOT_TOKEN = <你的bot token>
TELEGRAM_CHAT_ID = <chat id>
LOGIN_PASSWORD = <你的密码>
API_KEY = <随机字符串>
```

### 4. 发布 Worker
```bash
npm install -g wrangler
wrangler login
wrangler publish
```

### 5. Cloudflare Pages
将前端文件部署到 Cloudflare Pages，并在 JS 中把 apiBase 改为你的 Worker 地址。

### 登录使用
- 打开登录页输入密码
- 登录成功后可上传文件、查看图片/视频。
