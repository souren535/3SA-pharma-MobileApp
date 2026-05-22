const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ignore android and ios build directories to prevent Metro from crashing on FallbackWatcher
const customBlockList = [
  /.*\/android\/app\/.cxx\/.*/,
  /.*\/android\/app\/build\/.*/,
];

if (Array.isArray(config.resolver.blockList)) {
  config.resolver.blockList.push(...customBlockList);
} else if (config.resolver.blockList) {
  config.resolver.blockList = [config.resolver.blockList, ...customBlockList];
} else {
  config.resolver.blockList = customBlockList;
}

config.resolver.assetExts.push("avif");

module.exports = withNativeWind(config, { input: "./global.css" });
