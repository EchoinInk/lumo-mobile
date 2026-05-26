module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Transform import.meta to work with Hermes
      "transform-import-meta",
    ],
  };
};
