import React from "react";
import * as ReactDOMServer from "react-dom/server";
import { FilledContext } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { StaticData, StaticDataProvider } from "./context/StaticDataContext";
import { GetStaticData, SSGRoutes } from "./frame";
import fs from "fs/promises";
import path from "path";
import { getStaticPaths as blogPaths } from "./routes/blog.server";
import { getStaticData as indexStaticData } from "./routes/index.server";

// filesystem router is too complex so i code my routes by hand
const ssgRoutes: SSGRoutes = {
  path: "/",
  type: "page",
  getStaticData: indexStaticData,
  children: [
    { path: "asdf", type: "page" },
    {
      path: "blog",
      type: "dummy",
      children: blogPaths,
    },
  ],
};

const outputPath = path.join(process.cwd(), "build", "ssg");
const dataPath = path.join(process.cwd(), "build", "ssg", "_data");

const renderHtml = (pathname: string, jsBundlePath: string, data?: any) => {
  const helmetContext: FilledContext | {} = {};
  const markup = ReactDOMServer.renderToString(
    <StaticRouter location={pathname}>
      <StaticDataProvider initialData={{ path: pathname, data: data }} ssr>
        <App helmetContext={helmetContext} />
      </StaticDataProvider>
    </StaticRouter>
  );
  const { helmet } = helmetContext as FilledContext;

  let dataString = "";
  if (data) {
    const staticData: StaticData = {
      path: pathname,
      data: data,
    };
    const json = JSON.stringify(staticData);
    const escaped = json.replaceAll("<", "\\u003c").replaceAll(">", "\\u003e");
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

interface FlattenRoute {
  absolutePath: string;
  getStaticData?: GetStaticData<any>;
  assetsPath?: string;
}

const flattenRoutesAndGetStaticData = async (
  node: SSGRoutes,
  basePath?: string
): Promise<FlattenRoute[]> => {
  // 这个location写的太烂了
  let location = "";
  {
    if (basePath === undefined) {
      location = node.path;
    } else if (basePath.endsWith("/")) {
      location = basePath + node.path;
    } else {
      location = basePath + "/" + node.path;
    }
  }

  if (node.type === "asset") {
    return [
      {
        absolutePath: location,
        assetsPath: node.dirPath,
      },
    ];
  } else {
    // const data = await node.getStaticData?.({ path: location });

    const routes = [];

    if (node.type === "page") {
      const currentRoute: FlattenRoute = {
        absolutePath: location,
        getStaticData: node.getStaticData,
      };
      routes.push(currentRoute);
    }

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
  }
};

// todo 重构，把json拎出来

(async () => {
  const routes = await flattenRoutesAndGetStaticData(ssgRoutes);

  const jsBundlePath = await fs
    .readdir(path.join(outputPath, "js"))
    .then((dir) => dir.find((s) => s.match(/main\..*\.bundle.js/)))
    .then((fileName) => (!!fileName ? `js/${fileName}` : undefined));
  if (!jsBundlePath) {
    throw new Error("i cant find client js bundle");
  }

  // fs.mkdir有条件竞争，暂时先不并行
  // const tasks = routes.map(async (route) => {
  for (const route of routes) {
    if (route.assetsPath) {
      await fs.cp(
        route.assetsPath,
        path.join(outputPath, ...route.absolutePath.split("/")),
        { recursive: true }
      );
    } else {
      const data = await route.getStaticData?.({ path: route.absolutePath });
      // 输出html
      const html = renderHtml(route.absolutePath, jsBundlePath, data);

      let htmlFilePath = "";
      {
        if (route.absolutePath.endsWith("/")) {
          htmlFilePath = path.join(
            outputPath,
            ...route.absolutePath.split("/"),
            "index.html"
          );
        } else {
          htmlFilePath =
            path.join(outputPath, ...route.absolutePath.split("/")) + ".html";
        }
      }

      await fs.mkdir(path.dirname(htmlFilePath), {
        recursive: true,
        mode: 0o755,
      });
      await fs.writeFile(htmlFilePath, html);

      // 输出json
      if (data) {
        let jsonFilePath = "";
        {
          if (route.absolutePath === "/") {
            jsonFilePath = path.join(dataPath, "index.json");
          } else {
            jsonFilePath =
              path.join(dataPath, ...route.absolutePath.split("/")) + ".json";
          }
        }

        await fs.mkdir(path.dirname(jsonFilePath), {
          recursive: true,
          mode: 0o755,
        });
        await fs.writeFile(jsonFilePath, JSON.stringify(data));
      }
    }
  }

  const publicFileDir = path.join(process.cwd(), "public");
  await Promise.all(
    (
      await fs.readdir(publicFileDir)
    ).map((f) =>
      fs.cp(path.join(publicFileDir, f), path.join(outputPath, f), {
        recursive: true,
      })
    )
  );

  // await Promise.all(tasks);

  // 搬运assets
  // 示例：posts/{postname}/assets -> build/ssg/blog/{postname}/assets
  // 目前这里写死了搬运markdown的私有assets,如果以后有其他类似用例就不写死
  // const mdFileDir = path.join(process.cwd(), "posts");
  // const postNames: string[] = [];
  // {
  //   const dir = await fs.opendir(mdFileDir);
  //   for await (const dirent of dir) {
  //     if (dirent.isDirectory()) {
  //       postNames.push(dirent.name);
  //     }
  //   }
  // }
  // for (const post of postNames) {
  //   const src = path.join(
  //     mdFileDir,
  //     post
  //     // "assets"
  //   );
  //   const dest = path.join(
  //     process.cwd(),
  //     "build",
  //     "ssg",
  //     "blog",
  //     post
  //     // "assets"
  //   );
  //   await fs.cp(src, dest, { recursive: true });
  // }
})();

// flattenRoutesAndGetStaticData("/")

// todo: settings.js,用来控制一些常量，比如json文件的路径的前缀
