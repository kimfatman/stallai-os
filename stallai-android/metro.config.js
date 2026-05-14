const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support for Reanimated
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];
config.resolver.assetExts = ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'mp3', 'mp4', 'ttf', 'otf'];

module.exports = config;
