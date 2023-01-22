import { GetStaticData } from "../frame";
import { BlogPost, FrontMatter } from "../frame/markdown";

export interface BlogListStaticData {
  posts: {
    id: string;
    frontMatter: FrontMatter;
  }[];
}

export const getStaticData: GetStaticData<BlogListStaticData> = async () => {
  const posts = await BlogPost.listPosts();
  const data = await Promise.all(
    posts.map(async (p) => ({
      id: p.id,
      frontMatter: (await p.getData()).frontMatter,
    }))
  );
  // 按时间排序
  data.sort(
    (a, b) =>
      Date.parse(b.frontMatter.mtime ?? b.frontMatter.ctime) -
      Date.parse(a.frontMatter.mtime ?? a.frontMatter.ctime)
  );
  return {
    posts: data,
  };
};
