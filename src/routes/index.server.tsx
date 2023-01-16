import path from "path";
import { GetStaticData } from "../frame";
import fs from "fs/promises";
import { BlogPost, FrontMatter } from "../frame/markdown";

export interface HomeStaticData {
  posts: {
    id: string;
    frontMatter: FrontMatter;
  }[];
}

export const getStaticData: GetStaticData<HomeStaticData> = async (context) => {
  const posts = await BlogPost.listPosts();
  const data = await Promise.all(
    posts.map(async (p) => ({
      id: p.id,
      frontMatter: (await p.getData()).frontMatter,
    }))
  );
  return {
    posts: data,
  };
};

// todo 主页
