const path = require("path");
const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const devMode = process.env.NODE_ENV !== "production";

function getTemplates() {
  return new Promise(function (resolve, reject) {
    glob("**/!(_*).njk", function (error, files) {
      if (error) {
        return reject(error);
      }
      resolve(files);
    });
  });
}

function toPlugin(fileName) {
  return new HtmlWebpackPlugin({
    template: fileName,
    filename: fileName.replace(/\.njk$/, ".html"),
    chunks: [
      'core',
      fileName
        .split("/")
        .pop()
        .replace(/\.njk$/, ""),
    ],
  });
}

module.exports = async function () {
  const entryFiles = await getTemplates();
  const templates = entryFiles.map(toPlugin);
  const entry = entryFiles.reduce((files, filePath) => {
    const dir = path.dirname(filePath);
    const fileName = path.basename(filePath, ".njk");
    const file = path.join(__dirname, dir, `${fileName}.scss`);
    files[fileName] = file;

    return files;
  }, { core: path.join(__dirname, './src/sass/core.scss') });

  return {
    mode: "development",
    entry,
    devServer: {
      port: 9009,
      hot: true,
    },
    module: {
      rules: [
        {
          test: /\.njk$/,
          use: [
            {
              loader: "simple-nunjucks-loader",
              options: {},
            },
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
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
          test: /\.css$/i,
          use: [
            "style-loader",
            "css-loader",
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
          test: /\.css$/,
          use: ["style-loader", "postcss-loader"],
        },
      ],
    },
    plugins: [...templates],
  };
};
