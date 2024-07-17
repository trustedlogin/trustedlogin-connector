const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");
const isProduction = process.env.NODE_ENV === "production";

let entry = {};
const entryPoint = "trustedlogin-settings";
entry[`admin-page-${entryPoint}`] = path.resolve(
    process.cwd(),
    `src/${entryPoint}/index.js`
);

module.exports = {
  ...defaultConfig,
  mode: isProduction ? "production" : "development",
  entry,
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./wpbuild"),
  },
  module: {
    ...defaultConfig.module,
    rules: [
      ...defaultConfig.module.rules,
    ],
  },
  devtool: isProduction ? false : 'source-map',
};
