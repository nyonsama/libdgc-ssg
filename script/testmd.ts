import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import { matter } from "vfile-matter";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";
import { toHtml } from "hast-util-to-html";
import remarkToc from "remark-toc";
import { u } from "unist-builder";
import { h } from "hastscript";

const md = `---
title: asdf
date: mnvb
zzzz: 12341
---

# asdf!!
## Table of contents
## shit
pppp
## hjkl
oooo
`;
unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(() => (tree, file) => {
    matter(file, { strip: true });
  })
  .use(() => (tree, file) => {
    let tocIndex =
      tree.children.findIndex((c) => c.type === "heading" && c.depth === 1) + 1;
    tree.children = [
      ...tree.children.slice(0, tocIndex),
      u("heading", { depth: 2 as const }, [u("text", { value: "目录" })]),
      ...tree.children.slice(tocIndex),
    ];
  })
  .use(remarkToc, { heading: "目录" })
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(() => (tree, file) => {
    const toc: any[] = [];
    visit(tree, "element", (node) => {
      if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
        toc.push({
          id: node.properties?.id,
          level: parseInt(node.tagName[1]),
          content: toHtml(node.children),
        });
      }
    });
    file.data.toc = toc;
  })
  .use(() => (tree, file) => {
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
        tree.children.slice(tocHeadingIndex, tocIndex + 1) as any[]
      ),
      ...tree.children.slice(tocIndex + 1),
    ];
    console.log(tree.children);
  })
  .use(rehypeStringify)
  .process(md)
  .then((file) => {
    console.log(String(file));
    console.log(file.data);
    // console.log(JSON.stringify(file.data));
  });

// todo toc插件
