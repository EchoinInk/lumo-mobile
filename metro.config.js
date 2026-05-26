const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  "@": path.resolve(__dirname, "src"),
};

// Force zustand middleware to use CommonJS build instead of ESM (which uses import.meta)
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect zustand/middleware to CommonJS build
  if (moduleName === "zustand/middleware") {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "node_modules/zustand/middleware.cjs"),
    };
  }
  // Redirect zustand to CommonJS build
  if (moduleName === "zustand") {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "node_modules/zustand/index.cjs"),
    };
  }

  // expo-glass-effect ships no .web.js files — redirect all imports to a stub
  // that satisfies expo-router's runtime calls (e.g. isLiquidGlassAvailable).
  if (platform === "web" && moduleName.includes("expo-glass-effect")) {
    const glassStub = path.resolve(__dirname, "src/stubs/expo-glass-effect.js");
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
