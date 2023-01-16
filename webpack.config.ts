import * as webpack from "webpack";
import * as path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin"

// todo extract css in production

const isDev = process.env.NODE_ENV === "development" ? true : false;

const common: webpack.Configuration = {
  mode: isDev ? "development" : "production",
  // devtool: isDev ? "eval-source-map" : "source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.[jt]sx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "swc-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", "..."],
  },
};

// for development
export const csr: webpack.Configuration = {
  ...common,
  name: "dev",
  // mode: "development",
  devtool: "eval-source-map",
  entry: path.resolve(__dirname, "src", "entry.client.tsx"),
  target: "browserslist:development",
  output: {
    filename: "[name].[contenthash].bundle.js",
    path: path.resolve(__dirname, "build", "csr"),
    clean: true,
  },
  plugins: [new HtmlWebpackPlugin(),

  ],
};

// todo: code split

export const ssgClient: webpack.Configuration = {
  ...common,
  name: "ssgclient",
  // mode: "production",
  devtool: "source-map",
  entry: path.resolve(__dirname, "src", "entry.client.tsx"),
  target: "browserslist:production",
  output: {
    filename: "[name].[contenthash].bundle.js",
    path: path.resolve(__dirname, "build", "ssg"),
    clean: true,
  },
  optimization: {
    usedExports: true,
  },
  plugins:[
    new CopyWebpackPlugin({
      patterns:[
        {from:"public/*",to:"build/ssg/"}
      ]
    })
  ]
  // plugins: [new webpack.EnvironmentPlugin(["NODE_ENV"])],
};

export const ssgServer: webpack.Configuration = {
  ...common,
  name: "server",
  // mode: "production",
  mode: "development",
  devtool: "source-map",
  entry: path.resolve(__dirname, "src", "entry.server.tsx"),
  target: "browserslist:server",
  output: {
    filename: "server.js",
    path: path.resolve(__dirname, "build"),
    // library: {
    //   type: "commonjs",
    // },
    clean: false,
  },
  // plugins: [new webpack.EnvironmentPlugin(["NODE_ENV"])],
  // experiments: {
  //   outputModule: true,
  // },
};

// export default isDev ? csr : [ssgClient, ssgServer];
export default [csr, ssgClient, ssgServer];
