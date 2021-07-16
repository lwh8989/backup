const path = require("path");
const fs = require("fs");
const glob = require("glob");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isProd = process.env.NODE_ENV === "production";
const ROOT_VIEW_DIR = "src/view";
const marked = require("marked");
const renderer = new marked.Renderer();

function getTemplates() {
  return new Promise(function (resolve, reject) {
    glob(
      `${ROOT_VIEW_DIR}/**/*.njk`,
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

function getFilePath(fileName, ext = ".njk") {
  const dir = path.dirname(fileName).replace(`${ROOT_VIEW_DIR}/`, "");
  const file = path.basename(fileName, ext);
  return `${dir}/${file}`;
}

function toPlugin(fileName) {
  return new HtmlWebpackPlugin({
    template: fileName,
    filename: `${getFilePath(fileName)}.html`.replace(`${ROOT_VIEW_DIR}/`, ""),
    chunks: [fileName, "core", getFilePath(fileName)],
  });
}

module.exports = async function () {
  const entryFiles = await getTemplates();
  const templates = entryFiles.map(toPlugin);
  const guides = entryFiles
    .map((fileName) => {
      const scssFile = `${getFilePath(fileName)}.scss`;
      if (fs.existsSync(path.resolve(__dirname, ROOT_VIEW_DIR, scssFile))) {
        return scssFile;
      }
    })
    .filter(Boolean)
    .reduce((files, file) => {
      const key = getFilePath(file, ".scss");
      files[key] = path.resolve(__dirname, ROOT_VIEW_DIR, file);

      return files;
    }, {});
  // console.log("🚀 ~ file: webpack.config.js ~ line 58 ~ guides", guides);

  const plugins = [...templates];

  if (isProd) {
    plugins.push(new MiniCssExtractPlugin());
  }

  return {
    mode: isProd ? "production" : "development",
    target: ['web', 'es5'],
    entry: {
      core: "./src/sass/core.scss",
      view: entryFiles.map((entry) => path.resolve(__dirname, entry)),
      ...guides,
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
                searchPaths: [ROOT_VIEW_DIR],
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
        {
          test: /\.(jpe?g|png|gif|svg)$/,
          use : [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]'
              }
            }
          ]
        }
      ],
    },
    plugins,
  };
};
