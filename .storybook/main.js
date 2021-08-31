const path = require("path");

module.exports = {
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src/"),
    };
    return config;
  },
  stories: ["../docs/*.stories.mdx", "../docs/*.stories.@(js)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
};
