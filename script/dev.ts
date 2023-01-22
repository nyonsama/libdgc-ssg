import express from "express";
import webpack from "webpack";
import path from "path";
import chokidar from "chokidar";
import child_process from "child_process";
import { clientDev, server } from "../webpack.config.js";

const compiler = webpack([clientDev, server]);

const runCompiler = async (compiler: ReturnType<typeof webpack>) => {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        console.error("error:", err);
      } else {
        console.log(stats?.toString({ colors: true }));
      }
      if (err || stats?.hasErrors()) {
        reject(err ?? stats?.toString());
      } else {
        resolve(stats);
      }
    });
  });
};

// todo 根据哪个文件更新了选择性渲染
const runSSGScript = async () => {
  return new Promise((resolve, reject) => {
    child_process.exec(
      "node --enable-source-maps build/ssg.cjs",
      (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          console.log("static generation executed");
          resolve(undefined);
        }
        console.log(`stdout:${stdout}`);
        console.log(`stderr:${stderr}`);
      }
    );
  });
};

let taskIsRunning = false;
chokidar.watch(["src", "posts", "public"]).on("all", (event, path) => {
  if (taskIsRunning) {
    return;
  }
  taskIsRunning = true;
  console.log();
  console.log("Running task------------");
  runCompiler(compiler)
    .then(runSSGScript)
    .finally(() => {
      taskIsRunning = false;
    });
});

const app = express();

app.use((req, res, next) => {
  // todo 渲染这个path,输出到文件系统
  next();
});

const staticRoot = path.join(process.cwd(), "build", "ssg");
app.use(express.static(staticRoot, { extensions: ["html"] }));

// todo 404页面

// todo 手动实现文件改变之后自动刷新

app.listen(4000, () => {
  console.log("dev server started at http://localhost:4000");
});
