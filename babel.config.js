module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Add support for import.meta in web environment
      [
        "babel-plugin-transform-import-meta",
        {
          metaProperty: "meta",
        },
      ],
    ],
  };
};
