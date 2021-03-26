const path = require("path");
const fs = require("fs");
const glob = require("glob");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProd = process.env.NODE_ENV === "production";

function getTemplates() {
  return new Promise(function (resolve, reject) {
    glob(
      "src/view/**/*.njk",
      { ignore: "**/_include/**" },
      function (error, files) {
        if (error) {
          return reject(error);
        }
        resolve(files);
      }
    );
  });
}

function toPlugin(fileName) {
  return new HtmlWebpackPlugin({
    template: fileName,
    filename: fileName.replace(/\.njk$/, ".html").replace("src/view/", ""),
  });
}

module.exports = async function () {
  const entryFiles = await getTemplates();
  const templates = entryFiles.map(toPlugin);

  const plugins = [...templates];

  if (isProd) {
    plugins.push(new MiniCssExtractPlugin());
  }

  return {
    mode: isProd ? "production" : "development",
    entry: {
      html: entryFiles.map((entry) => path.resolve(__dirname, entry)),
      // index: "./src/view/index.njk",
      core: "./src/sass/core.scss",
    },
    devServer: {
      port: 9009,
      hot: true,
      host: "0.0.0.0",
    },
    optimization: {
      removeEmptyChunks: true,
    },
    module: {
      rules: [
        {
          test: /\.njk$/,
          use: [
            {
              loader: "simple-nunjucks-loader",
              options: {
                searchPaths: ["./src/view"],
              },
            },
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            isProd ? MiniCssExtractPlugin.loader : "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      "postcss-preset-env",
                      {
                        // Options
                      },
                    ],
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    plugins,
  };
};
