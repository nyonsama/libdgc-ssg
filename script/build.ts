import webpack from "webpack";
import WebpackCLI from "webpack-cli";
import { ssgServer, ssgClient } from "../webpack.config";
import render from "../build/ssg/server/index";
import path from "path";
import fs from "node:fs/promises";
// import render from "./src/entry.server";

console.log(render("/"));
const getPaths = async (current: string = ""):Promise<string[]> => {
  const paths = [];
  const entries = await fs.opendir(path.resolve("..", "src", "pages", current));
  for await (const dirent of entries) {
    if(dirent.isFile()){
      paths.push()
    }
  }
  return paths;
};

process.chdir(__dirname);
const wp = webpack([ssgClient, ssgServer]);
wp.run((err, result) => {
  if (err) {
    throw err;
  }
  console.log(result?.toString({ colors: true }));
  wp.close((err) => {
    if (err) {
      throw err;
    }
  });
});
