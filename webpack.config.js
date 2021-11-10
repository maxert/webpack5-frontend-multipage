const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const fs = require('fs');

let htmlPageNames = [];
const pages = fs.readdirSync('./src/html/pages');
pages.forEach(page => {
  if (page.endsWith('.html')) {
    htmlPageNames.push(page.split('.html')[0])
  }
})
const multipleHtmlPlugins = htmlPageNames.map(name => {
  return new HtmlWebpackPlugin({
    template: `./src/html/pages/${name}.html`, // relative path to the HTML files
    filename: `${name}.html`, // output HTML files
    minify: false,
    hash: false,
  })
});

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './js/index.bundle.js',
    publicPath: '',
  },
  devtool: 'source-map',
  performance: {
    hints: false,
  },
  resolve: {
    aliasFields: ['browser'],
    alias: {
      "@helpers": path.resolve(__dirname, './src/scripts/helpers'),
      "@header": path.resolve(__dirname, './src/scripts/layout/header'),
    },
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../"
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('autoprefixer')
              ],
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          },
        ],
        exclude: /node_modules/,
      },
      {
        enforce: 'pre', // checked before being processed by babel-loader
        test: /\.(js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,

      },
      {
        test: /\.(js)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },

      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              disable: process.env.NODE_ENV !== 'production', // Disable during development
              mozjpeg: {
                progressive: true,
                quality: 75
              },
            },
          }
        ],
        exclude: /node_modules/,
      },
      {
        test: /(favicon\.ico|site\.webmanifest|browserconfig\.xml|robots\.txt|humans\.txt)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?[a-z0-9=.]+)?$/,
        loader: 'file-loader',
        options: {
          outputPath: 'fonts',
          name: '[name].[ext]',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.PNG$|\.svg$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          context: path.resolve(__dirname, "src/"),
          useRelativePaths: true
        }
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  plugins: [
    new Dotenv({
      path: './.env'
    }),
    new MiniCssExtractPlugin({
      filename: './css/styles.css'
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: __dirname + '/src/images',
          to: 'images',
          noErrorOnMissing: true
        }
      ],
    }),
  ].concat(multipleHtmlPlugins),
}
