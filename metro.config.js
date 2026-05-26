const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// Disable Hermes globally to avoid import.meta issues
process.env.EXPO_USE_HERMES = "false";
process.env.EXPO_USE_FAST_RESOLVER = "1";

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  "@": path.resolve(__dirname, "src"),
};

// expo-glass-effect ships no .web.js files — redirect all imports to a stub
// that satisfies expo-router's runtime calls (e.g. isLiquidGlassAvailable).
const glassStub = path.resolve(__dirname, "src/stubs/expo-glass-effect.js");
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName.includes("expo-glass-effect")) {
    return { type: "sourceFile", filePath: glassStub };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Override transformer configuration to disable Hermes
config.transformer = {
  ...config.transformer,
  hermesParser: false,
  unstable_transformProfile: "default",
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Override server options to disable hermes-stable
config.server = {
  ...config.server,
  unstable_transformProfile: "default",
};

module.exports = withNativeWind(config, {
  input: "./src/global.css",
});
