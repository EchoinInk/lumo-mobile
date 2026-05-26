const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Disable Hermes and use default transform profile to avoid import.meta issues
  config.resolve.alias = {
    ...config.resolve.alias,
  };
  
  return config;
};
