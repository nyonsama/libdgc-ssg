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
import remarkToc from "remark-toc";
import { u } from "unist-builder";
import { h } from "hastscript";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { toc } from "mdast-util-toc";

const mdDir = path.join(process.cwd(), "posts");

export interface FrontMatter {
  title: string;
  ctime: string;
  mtime?: string;
  preview?: string;
  description: string;
  tags: string[];
  category: string;
}

const isValidFrontMatter = (o: any): o is FrontMatter => {
  const check: Array<keyof NonNullable<FrontMatter>> = [
    "title",
    "ctime",
    // "mtime",
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

export interface TocEntry {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** @description \<a href="#这个"\> */
  id: string;
  content: string;
}

export interface BlogPostData {
  frontMatter: FrontMatter;
  toc: TocEntry[];
  markup: string;
}

export class BlogPost {
  id: string;
  mdFilePath: string;
  assetPaths?: string[];
  private data?: BlogPostData;

  private constructor(id: string, mdFilePath: string, assetsPath?: string[]) {
    this.id = id;
    this.mdFilePath = mdFilePath;
    this.assetPaths = assetsPath;
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
      .use(() => (tree, file) => {
        // 在标题后面插入一个 "## 目录"
        let tocIndex =
          tree.children.findIndex(
            (c) => c.type === "heading" && c.depth === 1
          ) + 1;
        tree.children = [
          ...tree.children.slice(0, tocIndex),
          u("heading", { depth: 2 as const }, [u("text", { value: "目录" })]),
          ...tree.children.slice(tocIndex),
        ];
        // console.log(tree.children);
      })
      // .use(remarkToc, { heading: "目录", maxDepth: 3 })
      .use(() => (node) => {
        const result = toc(node, { heading: "目录", maxDepth: 3 });

        if (
          result.endIndex === null ||
          result.index === null ||
          result.index === -1 ||
          !result.map
        ) {
          return;
        }

        node.children = [
          ...node.children.slice(0, result.index),
          result.map,
          ...node.children.slice(result.index),
        ];
      })
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeSlug)
      .use(rehypeHighlight)
      .use(() => (tree, file) => {
        const toc: TocEntry[] = [];
        visit(tree, "element", (node) => {
          if (
            ["h2", "h3", "h4", "h5", "h6"].includes(node.tagName) &&
            node.properties?.id !== "目录"
          ) {
            toc.push({
              id: node.properties?.id as string,
              level: parseInt(node.tagName[1]) as TocEntry["level"],
              content: toHtml(node.children),
            });
          }
        });
        file.data.toc = toc;
      })
      .use(() => (tree, file) => {
        // 用<div>把插入的目录包起来
        const tocHeadingIndex = tree.children.findIndex(
          (c) => c.type === "element" && c.properties?.id === "目录"
        );
        if (tocHeadingIndex === -1) {
          return;
        }
        const tocIndex =
          tree.children
            .slice(tocHeadingIndex)
            .findIndex((c) => c.type === "element" && c.tagName === "ul") +
          tocHeadingIndex;

        tree.children = [
          ...tree.children.slice(0, tocHeadingIndex),
          h(
            "div.toc-wrap",
            h(
              // "div.not-prose.toc",
              "div.toc",
              tree.children.slice(tocHeadingIndex, tocIndex + 1) as any[]
            )
          ),
          ...tree.children.slice(tocIndex + 1),
        ];
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
    // console.log(String(vf));
    // console.log(vf.data.toc);
    return {
      frontMatter: vf.data.matter,
      toc: vf.data.toc as TocEntry[],
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
        const assetPaths = (await fs.readdir(path.join(mdDir, dirent.name)))
          .filter((n) => n !== "index.md")
          .map((f) => path.join(mdDir, id, f));
        posts.push(new BlogPost(id, filePath, assetPaths));
      } else {
        throw `${path.join(mdDir, dirent.name)} is strange`;
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

// interface Post {
//   id: string;
//   frontMatter: FrontMatter;
//   toc: TocEntry[];
//   assetPaths?: string;
//   markup: string;
// }

// const parseAndRender = async (
//   filePath: string
// ): Promise<Pick<Post, "frontMatter" | "toc" | "markup">> => {
//   const vf = await unified()
//     .use(remarkParse)
//     .use(remarkFrontmatter)
//     .use(() => (tree, file) => {
//       matter(file, { strip: true });
//       // console.log(file.data.matter);
//     })
//     .use(remarkRehype)
//     .use(rehypeSlug)
//     .use(() => (tree, file) => {
//       const toc: TocEntry[] = [];
//       visit(tree, "element", (node) => {
//         if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
//           toc.push({
//             id: node.properties?.id as string,
//             level: parseInt(node.tagName[1]) as TocEntry["level"],
//             content: toHtml(node.children),
//           });
//         }
//       });
//       file.data.toc = toc;
//     })
//     .use(rehypeStringify)
//     .process(await read(filePath));

//   if (!isValidFrontMatter(vf.data.matter)) {
//     throw new Error(
//       `${filePath} front matter(${JSON.stringify(vf.data.matter)}) not valid`
//     );
//   }
//   return {
//     frontMatter: vf.data.matter,
//     toc: vf.data.toc as TocEntry[],
//     markup: String(vf),
//   };
// };

// const listPostId = async () => {
//   const list: string[] = [];
//   const dir = await fs.opendir(mdDir);
//   for await (const dirent of dir) {
//     if (dirent.isFile() && dirent.name.match(/\.md$/)) {
//       list.push(dirent.name.replace(/\.md$/, ""));
//     } else if (dirent.isDirectory()) {
//       list.push(dirent.name);
//     }
//   }
//   return list;
// };

// const getPostById = async (id: string): Promise<Post> => {
//   try {
//     const filePath = path.join(mdDir, `${id}.md`);
//     await fs.access(filePath);
//     return {
//       id,
//       ...(await parseAndRender(filePath)),
//     };
//   } catch {}

//   try {
//     const filePath = path.join(mdDir, id, "index.md");
//     const assetsPath = path.join(mdDir, id);
//     await fs.access(filePath);
//     return {
//       id,
//       assetPaths: assetsPath,
//       ...(await parseAndRender(filePath)),
//     };
//   } catch {}

//   throw new Error(`cant find post with post id ${id}`);
// };

// const getPosts = async () => {
//   const mdList: Array<
//     Pick<Post, "id" | "assetPaths"> & { mdFilePath: string }
//   > = [];
//   {
//     const dir = await fs.opendir(mdDir);
//     for await (const dirent of dir) {
//       if (dirent.isFile() && dirent.name.match(/\.md$/)) {
//         mdList.push({
//           id: dirent.name.replace(/\.md$/, ""),
//           mdFilePath: path.join(mdDir, dirent.name),
//         });
//       } else if (dirent.isDirectory()) {
//         mdList.push({
//           id: dirent.name,
//           assetPaths: path.join(mdDir, dirent.name),
//           mdFilePath: path.join(mdDir, dirent.name, "index.md"),
//         });
//       }
//     }
//   }

//   const posts = new Map<string, Post>(
//     await Promise.all(
//       mdList.map(async (md) => {
//         return [
//           md.id,
//           {
//             id: md.id,
//             assetPaths: md.assetPaths,
//             ...(await parseAndRender(md.mdFilePath)),
//           },
//         ] as [string, Post];
//       })
//     )
//   );

//   return posts;
// };

// toc、frontmatter、markup
// toc用react渲染

// console.log(123);
// const posts = await getPosts();
// console.log(posts);
// console.log(JSON.stringify(Object.fromEntries(posts.entries()), undefined, 2));
