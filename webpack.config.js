const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const path = require("path");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // Set the app root to src/app
      projectRoot: path.resolve(__dirname),
    },
    argv
  );

  // Configure resolve to find the app directory
  config.resolve.alias = {
    ...config.resolve.alias,
    app: path.resolve(__dirname, "src/app"),
  };

  return config;
};
