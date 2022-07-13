const GitRevisionPlugin = require('git-revision-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const webpack = require('webpack')

// Used to make the build reproducible between different machines (IPFS-related)
module.exports = (config, env) => {
  const gitRevisionPlugin = new GitRevisionPlugin()
  const shortCommitHash = gitRevisionPlugin.commithash().substring(0, 8)

  const fallback = config.resolve.fallback || {}
  Object.assign(fallback, {
    fs: false,
    tls: require.resolve('tls'),
    net: require.resolve('net'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    path: require.resolve('path-browserify'),
  })
  config.resolve.fallback = fallback

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ])

  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    },
  ]

  if (env !== 'production') {
    return config
  }
  console.log({ shortCommitHash })
  config.output.filename = `static/js/[name].${shortCommitHash}.js`
  config.output.chunkFilename = `static/js/[name].${shortCommitHash}.chunk.js`

  // TODO: Need to fix the build file output hash
  // config.plugins = config.plugins.filter(
  //   plugin =>
  //     !(
  //       plugin instanceof WorkboxWebpackPlugin.GenerateSW ||
  //       // plugin instanceof ManifestPlugin ||
  //       plugin instanceof MiniCssExtractPlugin
  //     )
  // )
  // config.plugins.push(
  //   new webpack.DefinePlugin({
  //     process: { env: {} },
  //   })
  // )
  // config.module.rules[1].oneOf.find(rule => rule.loader === require.resolve('file-loader')).options.name =
  //   'static/media/[name].[ext]'
  // config.module.rules[1].oneOf.find(rule => rule.loader === require.resolve('url-loader')).options.name =
  //   'static/media/[name].[ext]'

  return config
}
