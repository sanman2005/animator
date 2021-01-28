const path = require('path');
const webpack = require('webpack');
const baseWebpackConfig = require(path.resolve(__dirname, '../webpack.config'));

module.exports = async ({ config }) => {
  const {
    module: { rules },
    resolve: { extensions },
  } = config;
  const {
    module: { rules: baseRules },
    resolve: { extensions: baseExtensions },
  } = baseWebpackConfig;

  extensions.push(...baseExtensions);
  rules.push(...baseRules, {
    test: /\.tsx$/,
    loader: require.resolve('react-docgen-typescript-loader'),
  });

  rules.forEach(rule => {
    const { source } = rule.test;

    if (source.indexOf('svg|') >= 0) {
      rule.test = new RegExp(`${source.replace('svg|', '')}`);
    }

    if (source.indexOf('styl') >= 0) {
      delete rule.use;
      rule.test = /\.styl(us)?$/;
      rule.loader = 'style-loader!css-loader?-url!stylus-loader';
    }
  });

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.APP_MODE': JSON.stringify('test'),
    }),
  );

  return config;
};
