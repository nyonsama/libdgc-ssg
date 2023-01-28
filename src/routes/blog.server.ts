import { LoaderFunction } from "react-router-dom";
import { PathTree } from "../frame";
import { BlogPost } from "../frame/markdown";
import fs from "fs/promises";
import path from "path";

type DirTree = {
  name: string;
  children?: DirTree[];
};

const walkDir = async (filePath: string): Promise<DirTree> => {
  const name = path.basename(filePath);
  const stat = await fs.stat(filePath);
  if (stat.isFile()) {
    return { name };
  } else if (stat.isDirectory()) {
    const dir = await fs.opendir(filePath);
    const children: DirTree[] = [];
    for await (const entry of dir) {
      const next = await walkDir(path.join(filePath, entry.name));
      children.push(next);
    }
    return { name, children };
  } else if (stat.isSymbolicLink()) {
    throw `${filePath} is a symbolic link and it is not supported currently`;
  } else {
    throw `${filePath} is so strange`;
  }
};

const walkAssetsDir = async (filePath: string): Promise<PathTree> => {
  const name = path.basename(filePath);
  const stat = await fs.stat(filePath);
  if (stat.isFile()) {
    return {
      name,
      type: "asset",
      filePath,
    };
  } else if (stat.isDirectory()) {
    const dir = await fs.opendir(filePath);
    const children: PathTree[] = [];
    for await (const entry of dir) {
      const next = await walkAssetsDir(path.join(filePath, entry.name));
      children.push(next);
    }
    return {
      name,
      type: "asset",
      filePath,
      children,
    };
  } else if (stat.isSymbolicLink()) {
    throw `${filePath} is a symbolic link and it is not supported currently`;
  } else {
    throw `${filePath} is some wired thing`;
  }
};

export const getStaticPaths = async (): Promise<PathTree[]> => {
  const posts = await BlogPost.listPosts();
  return Promise.all(
    posts.map(async (p) => {
      const node: PathTree = { name: p.id, type: "page" };
      if (p.assetPaths) {
        const children = await Promise.all(
          p.assetPaths.map((filePath) => walkAssetsDir(filePath))
        );
        node.children = children;
      }
      return node;
    })
  );
};

// export const getStaticPaths: GetStaticPaths = async () => {
//   const routes: SSGRoutes[] = [];
//   const posts = await BlogPost.listPosts();
//   for (const post of posts) {
//     routes.push({
//       path: post.id + "/",
//       type: "page",
//     });
//     if (post.assetsPath) {
//       routes.push({
//         path: post.id + "/",
//         type: "asset",
//         dirPath: post.assetsPath,
//       });
//     }
//   }

//   return routes;
// };

// todo 给markdown api加缓存

export const blogLoader: LoaderFunction = async ({ params, request }) => {
  const posts = await BlogPost.listPosts();
  const post = posts.find((p) => p.id === params.postId);
  return post?.getData();
};
