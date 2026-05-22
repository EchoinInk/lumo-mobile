const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@/src/")) {
    const realModuleName = moduleName.replace("@/src/", "");
    const absolutePath = path.resolve(__dirname, "src", realModuleName);
    return context.resolveRequest(context, absolutePath, platform);
  }

  if (moduleName.startsWith("@/")) {
    const realModuleName = moduleName.replace("@/", "");
    const absolutePath = path.resolve(__dirname, "src", realModuleName);
    return context.resolveRequest(context, absolutePath, platform);
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
