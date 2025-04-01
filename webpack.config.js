const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development', // Change to 'production' for production builds
  entry: './src/index.js', // Entry point of your application
  output: {
    path: path.resolve(__dirname, 'build'), // Output directory
    filename: 'bundle.js', // Output bundle file name
    publicPath: '/syt5-gek1051-mobile-application-shopstorm/'
  },
  devServer: {
    static: path.join(__dirname, 'public'), // Replace contentBase with static
    compress: true,
    port: 3000,
    historyApiFallback: true,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Process .js and .jsx files
        exclude: /node_modules/, // Exclude node_modules folder
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env', // Transpile ES6+ syntax
              '@babel/preset-react', // Transpile JSX syntax
            ],
            plugins: ['@babel/plugin-transform-runtime'], // Enable async/await support
          },
        },
      },
      {
        test: /\.css$/, // Process CSS files
        use: ['style-loader', 'css-loader'], // Inject CSS into DOM and parse CSS files
      },
      {
        test: /\.(png|jpg|gif|svg)$/, // Process image files
        type: 'asset/resource', // Output images as separate assets
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(), // Clean the output directory before each build
    new HtmlWebpackPlugin({
      template: './public/index.html', // Template HTML file to inject the bundle
      favicon: './public/favicon.ico', // Optional favicon file
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'], // Resolve these extensions automatically
    alias: {
      '@mui': path.resolve(__dirname, 'node_modules/@mui'), // Alias for Material-UI modules if needed
    },
  },
};
