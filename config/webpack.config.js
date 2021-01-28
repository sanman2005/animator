/* global __dirname */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');
const buildConfig = require('./build.config');
const srcPath = path.resolve(__dirname, '../', buildConfig.srcPath);

require('dotenv').config();

let env = process.env.NODE_ENV;

if (!env) {
  process.env.NODE_ENV = env = 'production';
}

const isProd = env === 'production';
const isDevServer = process.argv.some(v => v.includes('webpack-dev-server'));
const localPort = 3000;

process.env.APP_MODE = process.env.APP_MODE || 'work';

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: {
    client: path.resolve(srcPath, './js/client.tsx'),
  },
  output: {
    filename: () => `[name].[hash:8].js`,
    publicPath: '/',
    path: path.resolve(__dirname, '../', buildConfig.buildPath),
  },
  target: 'web',
  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.json',
      '.styl',
      '.css',
      '.svg',
    ],
    alias: {
      components: path.resolve(srcPath, './js/components'),
      config: path.resolve('./'),
      css: path.resolve(srcPath, './css'),
      img: path.resolve(srcPath, './img'),
      js: path.resolve(srcPath, './js'),
      models: path.resolve(srcPath, './js/models'),
      node: path.resolve(__dirname, '../node_modules'),
      pages: path.resolve(srcPath, './js/pages'),
    },
    mainFields: ['module', 'main'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: `${srcPath}/static/index.html`,
      hmr: !isProd,
      scriptLoading: 'defer',
    }),
    new CopyWebpackPlugin([
      {
        from: `${srcPath}/static`,
        to: './',
      },
      {
        from: `${srcPath}/manifest.json`,
        to: './',
      },
      {
        from: `${srcPath}/img`,
        to: './img',
      },
    ]),
    new webpack.DefinePlugin(
      Object.keys(process.env).reduce(
        (result, key) => ({
          ...result,
          [`process.env.${key}`]: JSON.stringify(process.env[key]),
        }),
        {},
      ),
    ),
  ],
  devtool: !isProd && 'source-map',
  devServer: isDevServer
    ? {
        historyApiFallback: true,
        host: '0.0.0.0',
        hot: true,
        open: true,
        overlay: true,
        port: localPort,
        publicPath: '/',
        public: `localhost:${localPort}`,
        writeToDisk: false,
      }
    : {},
  optimization: {
    minimize: isProd,
  },
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        type: 'javascript/auto',
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          configFile: path.resolve(__dirname, './eslint.config.json'),
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              configFileName: path.resolve(__dirname, './tsconfig.json'),
            },
          },
          {
            loader: 'source-map-loader',
          },
        ],
      },
      {
        test: /\.(styl(us)?|css)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer],
            },
          },
          'stylus-loader',
        ],
      },
      {
        test: /\.svg$/,
        loader: 'svg-react-loader',
      },
    ],
  },
  watch: isDevServer,
  watchOptions: {
    poll: true,
    ignored: /node_modules/,
  },
};
