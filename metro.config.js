const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

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

// Disable Hermes for web to avoid import.meta issues
const originalGetTransformOptions = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = async (args) => {
  const options = await originalGetTransformOptions(args);
  if (args.platform === "web") {
    options.transform = {
      ...options.transform,
      minify: false,
      hermesParser: false,
      inlineRequires: false,
      unstable_transformProfile: undefined,
    };
  }
  return options;
};

module.exports = withNativeWind(config, {
  input: "./src/global.css",
});
