var path = require('path');
var glob = require('glob');
var HtmlWebpackPlugin = require('html-webpack-plugin');

function getTemplates() {
  return new Promise(function(resolve, reject) {
    glob('**/!(_*).njk', function(error, files) {
      if (error) {
        return reject(error);
      }
      resolve(files);
    });
  });
}

function toPlugin(fileName) {
  return new HTMLWebpackPlugin({
    template: fileName,
    filename: fileName.replace(/\.njk$/, '.html')
  });
}

module.exports = function() {
  var templates = getTemplates().then((files) => files.map(toPlugin));

  return templates.then(function(templates) {
    return {
      mode: 'none',
      entry: './index.js',
      output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
      },
      devServer: {
        port: 9009,
      },
      module: {
        rules: [
          {
            test: /\.njk$/,
            use: [
                {
                    loader: 'simple-nunjucks-loader',
                    options: {}
                }
            ]
          },
          {
            test: /\.s[ac]ss$/i,
            use: [
              // Creates `style` nodes from JS strings
              'style-loader',
              // Translates CSS into CommonJS
              'css-loader',
              // Compiles Sass to CSS
              'sass-loader',
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
            use: ['style-loader', 'postcss-loader'],
          }
        ]
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: 'index.njk',
        }),
      ],
    }
  });
};