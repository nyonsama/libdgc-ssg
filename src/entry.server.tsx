import React from "react";
import * as ReactDOMServer from "react-dom/server";
import { FilledContext } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { StaticData, StaticDataProvider } from "./context/StaticDataContext";
import { SSGRoutes } from "./frame";
import fs from "fs/promises";
import path from "path";
import { getStaticPaths as blogPaths } from "./routes/blog.server";

// filesystem router is too complex so i code my routes by hand
const ssgRoutes: SSGRoutes = {
  path: "/",
  children: [
    { path: "asdf" },
    {
      path: "blog",
      children: blogPaths,
    },
  ],
};

interface RouteInfo {
  absolutePath: string;
  haveStaticData: boolean;
  data?: any;
}

const renderHtml = (route: RouteInfo, jsBundlePath: string) => {
  const helmetContext: FilledContext | {} = {};
  const markup = ReactDOMServer.renderToString(
    <StaticRouter location={route.absolutePath}>
      <StaticDataProvider
        initialData={{ path: route.absolutePath, data: route.data }}
        ssr
      >
        <App helmetContext={helmetContext} />
      </StaticDataProvider>
    </StaticRouter>
  );
  const { helmet } = helmetContext as FilledContext;

  let dataString = "";
  if (route.haveStaticData) {
    const staticData: StaticData = {
      path: route.absolutePath,
      data: route.data,
    };
    const json = JSON.stringify(staticData);
    const escaped = json.replace("<", "\\u003c").replace(">", "\\u003e");
    dataString = `<script id="__MY_DATA__" type="application/json">${escaped}</script>`;
  }

  return `<!DOCTYPE html>
<html ${helmet.htmlAttributes.toString()}>
  <head>
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    <script defer src="/${jsBundlePath}"></script>
    <!--insert script here-->
  </head>
  <body ${helmet.bodyAttributes.toString()}>
    <div id="root">${markup}</div>${dataString}
  </body>
</html>`;
};

const flattenRoutesAndGetStaticData = async (
  node: SSGRoutes,
  basePath?: string
): Promise<RouteInfo[]> => {
  // 这个location写的太烂了
  const location =
    basePath === undefined
      ? "/"
      : basePath === "/"
      ? basePath + node.path
      : [basePath, node.path].join("/");

  const data = await node.getStaticData?.({ path: location });
  const currentRoute: RouteInfo = {
    absolutePath: location,
    haveStaticData: !!node.getStaticData,
    data,
  };

  const routes: RouteInfo[] = [currentRoute];

  let children: SSGRoutes[] | undefined = undefined;
  if (node.children instanceof Array) {
    children = node.children;
  } else if (node.children instanceof Function) {
    children = await node.children();
  }

  if (children !== undefined) {
    for (const route of children) {
      routes.push(...(await flattenRoutesAndGetStaticData(route, location)));
    }
  }

  return routes;
};

(async () => {
  const htmlBaseDir = path.join(process.cwd(), "build", "ssg");
  const staticDataBaseDir = path.join(htmlBaseDir, "_data");
  const routes = await flattenRoutesAndGetStaticData(ssgRoutes);

  const jsBundlePath = await fs
    .readdir(htmlBaseDir)
    .then((dir) => dir.find((s) => s.match(/main\..*\.bundle.js/)));
  if (!jsBundlePath) {
    throw new Error("i cant find client js bundle");
  }

  for (const route of routes) {
    // 输出html
    const html = renderHtml(route, jsBundlePath);
    const htmlFileDir = path.join(
      htmlBaseDir,
      ...route.absolutePath.split("/").slice(0, -1)
    );
    await fs.mkdir(htmlFileDir, { recursive: true, mode: 0o755 });

    let htmlFilePath = "";
    if (route.absolutePath === "/") {
      htmlFilePath = path.join(htmlBaseDir, "index.html");
    } else {
      htmlFilePath =
        path.join(htmlBaseDir, ...route.absolutePath.split("/")) + ".html";
    }
    await fs.writeFile(htmlFilePath, html);

    // 输出json
    if (route.haveStaticData) {
      const jsonFileDir = path.join(
        staticDataBaseDir,
        ...route.absolutePath.split("/").slice(0, -1)
      );
      await fs.mkdir(jsonFileDir, { recursive: true, mode: 0o755 });

      let jsonFilePath = "";
      if (route.absolutePath === "/") {
        jsonFilePath = path.join(staticDataBaseDir, "index.json");
      } else {
        jsonFilePath =
          path.join(staticDataBaseDir, ...route.absolutePath.split("/")) +
          ".json";
      }
      await fs.writeFile(jsonFilePath, JSON.stringify(route.data));
    }
  }

  // 搬运assets
  // 示例：posts/{postname}/assets -> build/ssg/blog/{postname}/assets
  // 目前这里写死了搬运markdown的私有assets,如果以后有其他类似用例就不写死
  const mdFileDir = path.join(process.cwd(), "posts");
  const postNames: string[] = [];
  {
    const dir = await fs.opendir(mdFileDir);
    for await (const dirent of dir) {
      if (dirent.isDirectory()) {
        postNames.push(dirent.name);
      }
    }
  }
  for (const post of postNames) {
    const src = path.join(mdFileDir, post, "assets");
    const dest = path.join(
      process.cwd(),
      "build",
      "ssg",
      "blog",
      post,
      "assets"
    );
    await fs.cp(src, dest, { recursive: true });
  }
})();

// flattenRoutesAndGetStaticData("/")

// todo: settings.js,用来控制一些常量，比如json文件的路径的前缀
