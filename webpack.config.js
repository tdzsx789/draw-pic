const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: {
    main: ['./src/index.css', './src/apps/main-app/index.js'],
    secondary: ['./src/index.css', './src/apps/secondary-app/index.js'],
    worker: './src/worker.js',
  },
  target: ['web', 'es2018'],
  devServer: {
    static: './dist',
    port: 3000,
    hot: true,
    liveReload: true,
    open: ['main.html', 'secondary.html'],
    historyApiFallback: {
      rewrites: [
        { from: /^\/main/, to: '/main.html' },
        { from: /^\/secondary/, to: '/secondary.html' }
      ]
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }]
            ],
            plugins: [
              isDevelopment && require.resolve('react-refresh/babel')
            ].filter(Boolean)
          }
        }
      },
      {
        test: /\.css$/i,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          "css-loader"
        ],
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif|webp|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/[name].[hash][ext]'
        }
      }
    ],
  },
  plugins: [
    isDevelopment && new ReactRefreshWebpackPlugin({
      overlay: false
    }),
    !isDevelopment && new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      filename: 'main.html',
      template: './public/main/index.html',
      chunks: ['main', 'worker']
    }),
    new HtmlWebpackPlugin({
      filename: 'secondary.html',
      template: './public/secondary/index.html',
      chunks: ['secondary', 'worker']
    })
  ].filter(Boolean),
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
