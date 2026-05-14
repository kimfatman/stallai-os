@echo off
chcp 65001 > nul
echo ========================================
echo   摆摊AI经营OS - Android APK 构建脚本
echo ========================================
echo.

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo [1/5] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)
echo [OK] Node.js 已安装

echo.
echo [2/5] 安装依赖...
call npm install
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [OK] 依赖安装完成

echo.
echo [3/5] 生成 Android 项目...
call npx expo prebuild --platform android --clean
if errorlevel 1 (
    echo [错误] Android 项目生成失败
    pause
    exit /b 1
)
echo [OK] Android 项目生成完成

echo.
echo [4/5] 构建 APK...
cd android

:: 检查 gradlew
if not exist "gradlew" (
    echo [错误] 找不到 gradlew 文件
    pause
    exit /b 1
)

:: 构建 Release APK
call .\gradlew assembleRelease
if errorlevel 1 (
    echo [错误] APK 构建失败
    pause
    exit /b 1
)

echo [OK] APK 构建完成

echo.
echo [5/5] 复制 APK 到项目根目录...
cd ..
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    copy "android\app\build\outputs\apk\release\app-release.apk" "stallai-os.apk" /Y
    echo [OK] APK 已复制到: %PROJECT_DIR%stallai-os.apk
) else (
    echo [警告] 找不到 APK 文件
)

echo.
echo ========================================
echo   构建完成!
echo ========================================
echo.
echo APK 文件位置:
echo   %PROJECT_DIR%stallai-os.apk
echo.
echo 安装到手机:
echo   adb install stallai-os.apk
echo.
pause
