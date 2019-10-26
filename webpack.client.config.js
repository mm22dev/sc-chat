const path = require('path')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
      main: './src/client/index.js'
    },
    output: {
      path: path.join(__dirname, '/dist/assets'),
      filename: 'js/[name].js',
      sourceMapFilename: 'js/[name].map'
    },
    target: 'web',
    resolve: {
      extensions: ['*', '.html', '.js'],
      modules: ['node_modules']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: path.join(__dirname, '/dist/index.html'),
        template: path.join(__dirname, '/src/client/utils/template/index.html')
      }),
      new BrowserSyncPlugin({
        files: [
          './dist/*.html',
          './dist/js/*.js'
        ],
        host: 'localhost',
        port: 3000,
        server: { baseDir: ['dist'] }
      })
    ]
}
