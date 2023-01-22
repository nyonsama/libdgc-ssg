import { GetStaticPaths, SSGRoutes } from "../frame";
import { BlogPost } from "../frame/markdown";

export const getStaticPaths: GetStaticPaths = async () => {
  const routes: SSGRoutes[] = [];
  const posts = await BlogPost.listPosts();
  for (const post of posts) {
    routes.push({
      path: post.id + "/",
      type: "page",
      getStaticData: () => post.getData(),
    });
    if (post.assetsPath) {
      routes.push({
        path: post.id + "/",
        type: "asset",
        dirPath: post.assetsPath,
      });
    }
  }

  return routes;
};
