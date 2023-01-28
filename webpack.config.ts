import * as webpack from "webpack";
import * as path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

// todo extract css in production

const isDev = process.env.NODE_ENV === "development" ? true : false;

export const clientDev: webpack.Configuration = {
  name: "client-dev",
  mode: "development",
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
          },
        ],
      },
      {
        test: /\.[jt]sx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "swc-loader",
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp)$/,
        type: "asset/resource",
        generator: {
          // import asdf from "asdf.png" 在客户端的结果和服务端不一样，客户端是asdf完整的url,服务端只有文件名，所以客户端要去掉url前面的域名，只剩下pathname
          publicPath: "/assets/",
        },
      },
      // {
      //   test: /\.svg$/i,
      //   issuer: /\.[jt]sx?$/,
      //   use: ["@svgr/webpack"],
      // },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", "..."],
  },
  entry: path.join(process.cwd(), "src", "entry.client.tsx"),
  target: "browserslist:development",
  output: {
    filename: "[name].[contenthash].bundle.js",
    path: path.join(process.cwd(), "build", "ssg", "assets"),
    clean: true,
  },
  plugins: [new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" })],
};

export const client: webpack.Configuration = {
  ...clientDev,
  name: "client",
  mode: "production",
  devtool: "source-map",
  target: "browserslist:production",
};

export const server: webpack.Configuration = {
  name: "server",
  mode: "development",
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "css-loader",
            options: {
              modules: {
                exportOnlyLocals: true,
              },
            },
          },
          {
            loader: "postcss-loader",
          },
        ],
      },
      {
        test: /\.[jt]sx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "swc-loader",
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp)$/,
        type: "asset/resource",
        generator: {
          emit: false,
          // import asdf from "asdf.png" 在客户端的结果和服务端不一样，客户端是asdf完整的url,服务端只有文件名，所以服务端要手动加上/assets/前缀
          publicPath: "/assets/",
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", "..."],
  },
  entry: path.join(process.cwd(), "src", "entry.server.tsx"),
  target: "browserslist:server",
  output: {
    filename: "ssg.cjs",
    path: path.join(process.cwd(), "build"),
    clean: false,
  },
};

export default [client, clientDev, server];
