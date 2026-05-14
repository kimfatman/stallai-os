@echo off
chcp 65001 >nul
echo ========================================
echo   StallAI-OS GitHub 上传脚本
echo ========================================
echo.

:: 设置项目路径
set PROJECT_PATH=%~dp0
cd /d "%PROJECT_PATH%"

:: 检查是否安装了 GitHub CLI
where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 GitHub CLI (gh)
    echo.
    echo 请先安装 GitHub CLI:
    echo   方法1: winget install GitHub.cli
    echo   方法2: 从 https://cli.github.com/ 下载安装
    echo.
    pause
    exit /b 1
)

:: 检查是否已认证
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo [提示] 需要先登录 GitHub
    echo.
    gh auth login
    if %errorlevel% neq 0 (
        echo [错误] GitHub 认证失败
        pause
        exit /b 1
    )
)

echo [信息] GitHub CLI 已就绪
echo.

:: 创建远程仓库（如果不存在）
echo [步骤1] 创建 GitHub 仓库...
gh repo create stallai-os --public --description "摆摊AI经营OS - AI驱动的智能摆摊经营管理平台" --source=. --remote=origin --push 2>nul
if %errorlevel% equ 0 (
    echo [成功] 仓库创建成功并已推送代码
) else (
    echo [提示] 仓库可能已存在，尝试推送代码...
    git remote add origin https://github.com/$(gh api user --jq '.login')/stallai-os.git 2>nul
    git push -u origin main 2>nul || git push -u origin master 2>nul
)

echo.
echo ========================================
echo   上传完成！
echo ========================================
echo.
echo 仓库地址: https://github.com/$(gh api user --jq '.login')/stallai-os
echo.
pause
