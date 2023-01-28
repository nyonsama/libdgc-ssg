import { BlogPost, FrontMatter } from "../frame/markdown";

export interface HomeStaticData {
  posts: {
    id: string;
    frontMatter: FrontMatter;
  }[];
}

// 对于既需要静态生成数据又需要访问外部api的页面
// 不用loader请求外部api，直接用useEffect或者useSWR
// 或者不静态生成数据，弄个静态API，在客户端用loader请求两个api

export const getStaticData = async (): Promise<HomeStaticData> => {
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

// todo 主页
