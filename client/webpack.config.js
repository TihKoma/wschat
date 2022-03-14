const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'wschat.min.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },
    //   {
    //     test: /\.css$/,
    //     use: ["style-loader", "css-loader"],
    //   },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader"],
	  },
	  {
		test: /\.css$/i,
        use: [
			require.resolve('style-loader'),
			{
			   loader:require.resolve('css-loader'),
			   options: {
				  importLoaders:1,
				 //Вот с этой строки начинаем менять webpack.config
				  modules:true, // 1
			   }
			}
		 ]
	  },
	  {
		  test: /\.(png|gif|jpg|woff|woff2|eot|ttf|svg)$/, 
		  use: ['url-loader?limit=100000']
	  }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
}