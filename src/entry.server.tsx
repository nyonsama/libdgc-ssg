import * as ReactDOMServer from "react-dom/server";
import { FilledContext, HelmetProvider } from "react-helmet-async";
import {
  createStaticRouter,
  StaticRouterProvider,
} from "react-router-dom/server";
import { PathTree } from "./frame";
import fs from "fs/promises";
import path from "path";
import { blogLoader, getStaticPaths as blogPaths } from "./routes/blog.server";
import { getStaticData as indexStaticData } from "./routes/index.server";
import { getStaticData as blogListStaticData } from "./routes/bloglist.server";
import { RouteObject } from "react-router-dom";
import Home from "./routes";
import About from "./routes/about";
import Blog from "./routes/blog";
import BlogList from "./routes/bloglist";
import BlogRoll from "./routes/blogroll";
import GlobalHeads from "./components/GlobalHeads";
import { createStaticHandler } from "@remix-run/router";

const outputPath = path.join(process.cwd(), "build", "ssg");
const dataPath = path.join(process.cwd(), "build", "ssg", "_data");

const staticPaths: PathTree = {
  name: "",
  type: "page",
  children: [
    { name: "blogroll", type: "page" },
    { name: "about", type: "page" },
    {
      name: "blog",
      type: "page",
      children: blogPaths,
    },
  ],
};

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
    loader: () => indexStaticData(),
  },
  {
    path: "/blog/",
    element: <BlogList />,
    loader: () => blogListStaticData(),
  },
  { path: "/blogroll", element: <BlogRoll /> },
  { path: "/about", element: <About /> },
  {
    path: "/blog/:postId",
    element: <Blog />,
    loader: blogLoader,
  },
];

// 不实现url params，因为没办法导出成单独的html文件

const visitPaths = async (
  node: PathTree,
  visitor: (pathname: string, node: PathTree) => Promise<void>,
  base = ""
): Promise<void> => {
  base = base.replace(/\/$/, "");
  let currentBase = base + "/" + node.name;
  if (node.children && !currentBase.endsWith("/")) {
    currentBase += "/";
  }
  await visitor(currentBase, node);
  if (node.children) {
    const children =
      node.children instanceof Array ? node.children : await node.children();
    for (const next of children) {
      await visitPaths(next, visitor, currentBase);
    }
  }
};

const pathnameToFsPath = (pathname: string) => {
  return path.join(outputPath, ...pathname.split("/"));
};

const render = async (
  pathname: string,
  routes: RouteObject[],
  resourcePath: { js?: string; css?: string }
) => {
  // some boilerplate code that copied from react-router ssr-data-router example
  let { query } = createStaticHandler(routes);
  const context = await query(new Request(`http://dummy${pathname}`));
  if (context instanceof Response) {
    throw context;
  }
  const router = createStaticRouter(routes, context);

  // context.loaderData的类型是interface RouteData { [routeId: string]: any; }，不知道routeId是多少，不过在ssr时似乎只有一个键值对
  const staticData = JSON.stringify(Object.values(context.loaderData)[0]) as
    | string
    | undefined;

  const { js, css } = resourcePath;
  const helmetContext: FilledContext | {} = {};
  const markup = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <GlobalHeads />
      <StaticRouterProvider router={router} context={context} />
    </HelmetProvider>
  );
  const { helmet } = helmetContext as FilledContext;

  const cssMarkup = css ? `<link href="${css}" rel="stylesheet">` : "";
  const jsMarkup = js ? `<script defer src="${js}"></script>` : ""; // 先不做代码分割

  return {
    staticData,
    html: `<!DOCTYPE html>
<html ${helmet.htmlAttributes.toString()}>
  <head>
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${cssMarkup}
    ${jsMarkup}
    ${helmet.link.toString()}
  </head>
  <body ${helmet.bodyAttributes.toString()}>
    <div id="root">${markup}</div>
  </body>
</html>`,
  };
};

(async () => {
  const jsBundlePath = await fs
    .readdir(path.join(outputPath, "assets"))
    .then((dir) => dir.find((s) => s.match(/main\..*\.bundle.js/)))
    .then((fileName) => (!!fileName ? `/assets/${fileName}` : undefined));
  if (!jsBundlePath) {
    throw new Error("i cant find client js bundle");
  }

  const cssBundlePath = await fs
    .readdir(path.join(outputPath, "assets"))
    .then((dir) => dir.find((s) => s.match(/main\..*\.css/)))
    .then((fileName) => (!!fileName ? `/assets/${fileName}` : undefined));

  await visitPaths(staticPaths, async (pathname, node) => {
    console.log(pathname);
    const destPath = pathnameToFsPath(pathname);
    if (node.type === "asset") {
      if (pathname.endsWith("/")) {
        await fs.mkdir(destPath, { recursive: true, mode: 0o755 });
      } else {
        await fs.copyFile(node.filePath, destPath);
      }
    } else if (node.type === "page") {
      if (pathname.endsWith("/")) {
        await fs.mkdir(destPath, { recursive: true, mode: 0o755 });
      }
      const { html, staticData } = await render(pathname, routes, {
        js: jsBundlePath,
        css: cssBundlePath,
      });
      const htmlFilePath = pathname.endsWith("/")
        ? path.join(destPath, "index.html")
        : destPath + ".html";
      await fs.writeFile(htmlFilePath, html);

      // write json
      const jsonPath =
        pathname === "/"
          ? path.join(dataPath, "index.json")
          : path.join(dataPath, ...pathname.split("/")) + ".json";
      await fs.mkdir(path.dirname(jsonPath), { recursive: true });
      if (staticData) {
        await fs.writeFile(jsonPath, staticData);
      }
    } else {
      // do nothing
    }
  });

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
})();
