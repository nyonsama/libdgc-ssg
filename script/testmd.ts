import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import { matter } from "vfile-matter";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";
import { toHtml } from "hast-util-to-html";

const md = `---
title: asdf
date: mnvb
zzzz: 12341
---

# asdf!!
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
  .use(rehypeStringify)
  .process(md)
  .then((file) => {
    console.log(String(file));
    console.log(file.data);
    // console.log(JSON.stringify(file.data));
  });

// todo toc插件
