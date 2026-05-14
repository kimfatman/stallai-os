# 摆摊AI经营OS - Android 构建脚本

## 快速构建

### 方式一：使用本地构建（推荐）

1. 打开终端，进入项目目录
2. 运行以下命令：

```bash
cd "C:\Users\Administrator\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a0422cf2f45dcc12749119b\stallai-android"

# 安装依赖
npm install

# 构建 Android 项目
npx expo prebuild --platform android --clean

# 打包 APK
cd android
./gradlew assembleRelease
```

3. APK 文件将生成在：
   `android/app/build/outputs/apk/release/app-release.apk`

### 方式二：使用 EAS 云构建

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login

# 构建
eas build --platform android --profile preview
```

### 方式三：使用 Expo Go 测试

```bash
npx expo start
# 然后在 Expo Go App 中扫描二维码
```

## 系统要求

- Node.js >= 18
- Java JDK 11+
- Android SDK
- Android Studio (可选，用于模拟器)

## APK 文件位置

构建完成后，APK 文件位于：
- `android/app/build/outputs/apk/release/app-release.apk`
- 或 `android/app/build/outputs/apk/debug/app-debug.apk`

## 注意事项

1. 首次构建需要下载 Android SDK
2. 确保网络连接正常
3. 构建过程可能需要 5-15 分钟

## 故障排除

如果遇到问题：

1. 清理并重新安装：
```bash
rm -rf node_modules package-lock.json
npm install
```

2. 重新生成原生代码：
```bash
npx expo prebuild --platform android --clean
```

3. 检查 Android SDK：
```bash
echo $ANDROID_HOME
```
