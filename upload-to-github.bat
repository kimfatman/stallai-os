@echo off
chcp 65001 > nul
echo ========================================
echo   摆摊AI经营OS - GitHub上传脚本
echo ========================================
echo.

:: 设置项目路径
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

:: 检查Git是否安装
git --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Git，请先安装Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: 检查gh是否安装
gh --version >nul 2>&1
if errorlevel 1 (
    echo [警告] 未检测到GitHub CLI (gh)
    echo [提示] 推荐安装: winget install GitHub.cli
    echo.
)

echo [1/6] 初始化Git仓库...
git init

echo [2/6] 创建.gitignore文件...
if not exist ".gitignore" (
    echo # Dependencies > .gitignore
    echo node_modules/ >> .gitignore
    echo .pnpm-store/ >> .gitignore
    echo dist/ >> .gitignore
    echo build/ >> .gitignore
    echo .env >> .gitignore
    echo .env.* >> .gitignore
    echo !.env.example >> .gitignore
    echo .idea/ >> .gitignore
    echo .vscode/ >> .gitignore
    echo *.log >> .gitignore
    echo .DS_Store/ >> .gitignore
    echo stallai-app/.expo/ >> .gitignore
    echo stallai-backend/dist/ >> .gitignore
    echo stallai-backend/node_modules/ >> .gitignore
    echo. >> .gitignore
)

echo [3/6] 添加所有文件...
git add .

echo [4/6] 创建初始提交...
git commit -m "feat: 初始化摆摊AI经营OS项目

- React Native Expo 移动应用
- NestJS 后端服务
- AI Agent 智能分析系统
- 完整数据库设计
- Docker 配置"

echo.
echo [5/6] 请选择GitHub仓库创建方式:
echo   1. 使用 gh 命令创建 (需要先安装GitHub CLI)
echo   2. 手动在GitHub创建仓库
echo.
set /p choice="请输入选项 (1/2): "

if "%choice%"=="1" (
    echo [提示] 请确保已登录GitHub: gh auth login
    gh repo create stallai-os --public --clone=false --description "摆摊AI经营OS - AI驱动的智能摆摊经营管理平台"
) else (
    echo.
    echo [提示] 请在GitHub上创建仓库后，运行以下命令:
    echo   git remote add origin https://github.com/YOUR_USERNAME/stallai-os.git
    echo.
    set /p remote_url="请输入仓库URL: "
    git remote add origin %remote_url%
)

echo [6/6] 推送到GitHub...
git branch -M main
git push -u origin main --force

echo.
echo ========================================
echo   上传完成!
echo ========================================
pause
