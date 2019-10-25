const nodeExternals = require('webpack-node-externals')

module.exports = (env, options) => {
  const isDevMode = options.mode === 'development'
  return {
    entry: './src/server/index.js',
    output: {
      path: __dirname,
      filename: 'server.js'
    },
    target: 'node',
    externals: [nodeExternals()],
    devtool: isDevMode ? '#source-map' : false,
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        }
      ]
    }
  }
}
