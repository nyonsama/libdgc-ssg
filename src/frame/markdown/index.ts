import path from "path";
import fs from "fs/promises";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import { matter } from "vfile-matter";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";
import { toHtml } from "hast-util-to-html";
import { toVFile, read } from "to-vfile";
import rehypeRaw from "rehype-raw";

const mdDir = path.join(process.cwd(), "posts");

export interface FrontMatter {
  title: string;
  ctime: string;
  mtime: string;
  description: string;
  tags: string[];
  category: string;
}

const isValidFrontMatter = (o: any): o is FrontMatter => {
  const check: Array<keyof FrontMatter> = [
    "title",
    "ctime",
    "mtime",
    "description",
    "tags",
    "category",
  ];
  const keys = Object.keys(o);
  for (const k of check) {
    if (!keys.includes(k)) {
      return false;
    }
  }
  return true;
};

interface Toc {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** @description \<a href="#这个"\> */
  id: string;
  content: string;
}

export interface BlogPostData {
  frontMatter: FrontMatter;
  toc: Toc[];
  markup: string;
}

export class BlogPost {
  id: string;
  mdFilePath: string;
  assetsPath?: string;
  private data?: BlogPostData;

  private constructor(id: string, mdFilePath: string, assetsPath?: string) {
    this.id = id;
    this.mdFilePath = mdFilePath;
    this.assetsPath = assetsPath;
  }

  private async parseAndRender(): Promise<BlogPostData> {
    const vf = await unified()
      .use(remarkParse)
      // .use(() => (tree, file) => {
      //   console.log("------------------------------");
      //   console.log(tree);
      //   console.log("------------------------------");
      // })
      .use(remarkFrontmatter)
      .use(() => (tree, file) => {
        matter(file, { strip: true });
        // console.log(file.data.matter);
      })
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeSlug)
      .use(() => (tree, file) => {
        const toc: Toc[] = [];
        visit(tree, "element", (node) => {
          if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
            toc.push({
              id: node.properties?.id as string,
              level: parseInt(node.tagName[1]) as Toc["level"],
              content: toHtml(node.children),
            });
          }
        });
        file.data.toc = toc;
      })
      .use(rehypeStringify)
      .process(await read(this.mdFilePath));

    if (!isValidFrontMatter(vf.data.matter)) {
      throw new Error(
        `${this.mdFilePath} front matter(${JSON.stringify(
          vf.data.matter
        )}) not valid`
      );
    }
    return {
      frontMatter: vf.data.matter,
      toc: vf.data.toc as Toc[],
      markup: String(vf),
    };
  }

  async getData() {
    // todo 缓存data
    // if (!this.data) {
    //   this.data = await this.parseAndRender();
    // }
    // return this.data;
    return await this.parseAndRender();
  }

  static async listPosts(): Promise<BlogPost[]> {
    // todo 缓存
    const posts: BlogPost[] = [];
    const dir = await fs.opendir(mdDir);
    for await (const dirent of dir) {
      if (dirent.isFile() && dirent.name.match(/\.md$/)) {
        const id = dirent.name.replace(/\.md$/, "");
        const filePath = path.join(mdDir, dirent.name);
        posts.push(new BlogPost(id, filePath));
      } else if (dirent.isDirectory()) {
        const id = dirent.name;
        const filePath = path.join(mdDir, dirent.name, "index.md");
        const assetsPath = path.join(mdDir, dirent.name);
        posts.push(new BlogPost(id, filePath, assetsPath));
      }
    }
    return posts;
  }

  // static async listIds(): Promise<string[]> {
  //   const ids: string[] = [];
  //   const dir = await fs.opendir(mdDir);
  //   for await (const dirent of dir) {
  //     if (dirent.isFile() && dirent.name.match(/\.md$/)) {
  //       const id = dirent.name.replace(/\.md$/, "");
  //       ids.push(id);
  //     } else if (dirent.isDirectory()) {
  //       const id = dirent.name;
  //       ids.push(id);
  //     }
  //   }
  //   return ids;
  // }

  // static async getPostById(id: string): Promise<BlogPost> {
  //   try {
  //     const filePath = path.join(mdDir, `${id}.md`);
  //     await fs.access(filePath);
  //     return new BlogPost(id, filePath);
  //   } catch {}

  //   try {
  //     const filePath = path.join(mdDir, id, "index.md");
  //     await fs.access(filePath);
  //     const assetsPath = path.join(mdDir, id);
  //     return new BlogPost(id, filePath, assetsPath);
  //   } catch {}

  //   throw new Error(`i cant find a post with id ${id}`);
  // }
}

interface Post {
  id: string;
  frontMatter: FrontMatter;
  toc: Toc[];
  assetsPath?: string;
  markup: string;
}

const parseAndRender = async (
  filePath: string
): Promise<Pick<Post, "frontMatter" | "toc" | "markup">> => {
  const vf = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(() => (tree, file) => {
      matter(file, { strip: true });
      // console.log(file.data.matter);
    })
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(() => (tree, file) => {
      const toc: Toc[] = [];
      visit(tree, "element", (node) => {
        if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
          toc.push({
            id: node.properties?.id as string,
            level: parseInt(node.tagName[1]) as Toc["level"],
            content: toHtml(node.children),
          });
        }
      });
      file.data.toc = toc;
    })
    .use(rehypeStringify)
    .process(await read(filePath));

  if (!isValidFrontMatter(vf.data.matter)) {
    throw new Error(
      `${filePath} front matter(${JSON.stringify(vf.data.matter)}) not valid`
    );
  }
  return {
    frontMatter: vf.data.matter,
    toc: vf.data.toc as Toc[],
    markup: String(vf),
  };
};

const listPostId = async () => {
  const list: string[] = [];
  const dir = await fs.opendir(mdDir);
  for await (const dirent of dir) {
    if (dirent.isFile() && dirent.name.match(/\.md$/)) {
      list.push(dirent.name.replace(/\.md$/, ""));
    } else if (dirent.isDirectory()) {
      list.push(dirent.name);
    }
  }
  return list;
};

const getPostById = async (id: string): Promise<Post> => {
  try {
    const filePath = path.join(mdDir, `${id}.md`);
    await fs.access(filePath);
    return {
      id,
      ...(await parseAndRender(filePath)),
    };
  } catch {}

  try {
    const filePath = path.join(mdDir, id, "index.md");
    const assetsPath = path.join(mdDir, id);
    await fs.access(filePath);
    return {
      id,
      assetsPath,
      ...(await parseAndRender(filePath)),
    };
  } catch {}

  throw new Error(`cant find post with post id ${id}`);
};

const getPosts = async () => {
  const mdList: Array<
    Pick<Post, "id" | "assetsPath"> & { mdFilePath: string }
  > = [];
  {
    const dir = await fs.opendir(mdDir);
    for await (const dirent of dir) {
      if (dirent.isFile() && dirent.name.match(/\.md$/)) {
        mdList.push({
          id: dirent.name.replace(/\.md$/, ""),
          mdFilePath: path.join(mdDir, dirent.name),
        });
      } else if (dirent.isDirectory()) {
        mdList.push({
          id: dirent.name,
          assetsPath: path.join(mdDir, dirent.name),
          mdFilePath: path.join(mdDir, dirent.name, "index.md"),
        });
      }
    }
  }

  const posts = new Map<string, Post>(
    await Promise.all(
      mdList.map(async (md) => {
        return [
          md.id,
          {
            id: md.id,
            assetsPath: md.assetsPath,
            ...(await parseAndRender(md.mdFilePath)),
          },
        ] as [string, Post];
      })
    )
  );

  return posts;
};

// toc、frontmatter、markup
// toc用react渲染

// console.log(123);
// const posts = await getPosts();
// console.log(posts);
// console.log(JSON.stringify(Object.fromEntries(posts.entries()), undefined, 2));
