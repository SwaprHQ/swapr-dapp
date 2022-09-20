const GitRevisionPlugin = require('git-revision-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const webpack = require('webpack')

// Used to make the build reproducible between different machines (IPFS-related)
module.exports = (config, env) => {
  const isProd = env === 'production'
  const isAnalyze = process.env.BUNDLE_ANALYZE === 'true'
  const lazyCompilation = process.env.LAZY_COMPILATION === 'true'

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

  config.plugins = (config.plugins || []).concat(
    [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
      isAnalyze ? new BundleAnalyzerPlugin() : false,
    ].filter(Boolean)
  )

  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    },
  ]
  config.experiments = {
    ...config.experiments,
    lazyCompilation,
  }

  if (!isProd) {
    return config
  }

  config.output.filename = `static/js/[name].${shortCommitHash}.js`
  config.output.chunkFilename = `static/js/[name].${shortCommitHash}.chunk.js`

  return config
}
