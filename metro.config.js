const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  "@": path.resolve(__dirname, "src"),
  // Force Zustand to use CommonJS builds instead of ESM (which uses import.meta)
  zustand: path.resolve(__dirname, "node_modules/zustand/index.js"),
  "zustand/react": path.resolve(__dirname, "node_modules/zustand/react"),
  "zustand/middleware": path.resolve(
    __dirname,
    "node_modules/zustand/middleware.js",
  ),
  "zustand/vanilla": path.resolve(__dirname, "node_modules/zustand/vanilla.js"),
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

module.exports = withNativeWind(config, {
  input: "./src/global.css",
});
