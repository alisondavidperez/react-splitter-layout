const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: [
    './javascripts/index.jsx'
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.css'],
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
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/env',
                '@babel/react'
              ]
            }
          }
        ]
      }, 
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname),
    filename: 'bundle.js'
  },
  devServer: {
    static: {
      directory: __dirname,
    },
    hot: true,
    port: 8081
  }
};
