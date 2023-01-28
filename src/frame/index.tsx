import { LoaderFunction } from "react-router-dom";

const pagePathToJsonPath = (pathname: string) => {
  if (pathname === "/") {
    return "/_data/index.json";
  } else {
    return `/_data${pathname.replace(/\/$/, "")}.json`;
  }
};

export const staticDataLoader: LoaderFunction = ({ request }) => {
  const pathname = new URL(request.url).pathname;
  return fetch(pagePathToJsonPath(pathname));
};

// 不实现url params，因为没办法导出成单独的html文件

interface PathBase {
  name: string;
  children?: PathTree[] | (() => Promise<PathTree[]>);
}

interface PagePath extends PathBase {
  type: "page";
}
interface DummyPath extends PathBase {
  type: "dummy";
}
interface AssetPath extends PathBase {
  type: "asset";
  filePath: string;
}

export type PathTree = PagePath | DummyPath | AssetPath;
