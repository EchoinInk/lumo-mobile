const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// Force environment variables before loading config
process.env.EXPO_USE_HERMES = "false";
process.env.EXPO_UNSTABLE_TRANSFORM_PROFILE = "default";

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

// Force transformer configuration for web
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

// Override getTransformOptions to force settings for web
const originalGetTransformOptions = config.getTransformOptions;
config.getTransformOptions = async (entryPoints, options) => {
  const result =
    (await originalGetTransformOptions?.(entryPoints, options)) || {};

  if (options.platform === "web") {
    return {
      ...result,
      transform: {
        ...result.transform,
        hermesParser: false,
        unstable_transformProfile: "default",
        minify: false,
      },
    };
  }

  return result;
};

module.exports = withNativeWind(config, {
  input: "./src/global.css",
});
