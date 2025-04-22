const { resolve } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: [
    './index.js'
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      crypto: false,
      stream: false,
      buffer: false
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: 'src/stylesheets/*', 
          to: '[name].[ext]'
        }
      ]
    })
  ],
  output: {
    path: resolve(__dirname, 'lib'),
    filename: 'index.js',
    library: {
      name: 'react-splitter-layout',
      type: 'umd'
    },
    globalObject: 'this'
  },
  externals: {
    react: 'react',
    'prop-types': 'prop-types'
  }
};
