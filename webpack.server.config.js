const nodeExternals = require('webpack-node-externals')

module.exports = {  
    entry: './src/server/index.js',
    output: {
      path: __dirname,
      filename: 'server.js'
    },
    target: 'node',
    resolve: {
      extensions: ['*', '.js', '.graphql'],
      modules: ['node_modules']
    },
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        }
      ]
    }
}
