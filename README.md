# JayT Crazy Eights (JayT 疯狂 8 点)

一个基于 React + Tailwind CSS 构建的经典纸牌游戏。

## 部署到 Vercel 指南

由于我无法直接操作您的 GitHub 或 Vercel 账户，请按照以下步骤进行手动部署：

### 1. 准备代码
1. 在 AI Studio 预览界面中，点击右上角的 **"Download"** 按钮（如果有）或者手动复制所有文件内容到本地文件夹。
2. 确保本地安装了 [Node.js](https://nodejs.org/)。

### 2. 同步到 GitHub
1. 在 GitHub 上创建一个新的仓库（Repository）。
2. 在本地项目根目录下运行以下命令：
   ```bash
   git init
   git add .
   git commit -m "Initial commit: JayT Crazy Eights"
   git branch -M main
   git remote add origin <您的GitHub仓库地址>
   git push -u origin main
   ```

### 3. 部署到 Vercel
1. 登录 [Vercel 官网](https://vercel.com/)。
2. 点击 **"Add New"** -> **"Project"**。
3. 导入您刚刚创建的 GitHub 仓库。
4. Vercel 会自动识别这是一个 Vite 项目。
5. 点击 **"Deploy"**。
6. 等待几分钟，您的游戏就会在线运行了！

## 技术栈
- React 19
- Tailwind CSS 4
- Motion (动画)
- Lucide React (图标)
- Vite (构建工具)
