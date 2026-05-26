const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Force environment variables
  process.env.EXPO_USE_HERMES = "false";
  process.env.EXPO_UNSTABLE_TRANSFORM_PROFILE = "default";

  return config;
};
