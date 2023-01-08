import { BlogStaticData } from "./blog";
import { GetStaticPaths, SSGRoutes, GetStaticData } from "../frame";
import fs from "fs/promises";
import path from "path";

// const mdFilePathToPath = (filePath: string) => {};
// const mdPathToFilePath = () => {};

// todo:可选：弄一个privateAssets函数，返回markdown私有的资产，来控制构建时把这个webpack管不了的资产放哪
// 不过这个太特殊了，先写死
// 还是不写死了
// 还是先写死在entry.server里面吧
// export const getAssets = async()=>{
// 有些东西不适合放进json，不能用getStaticData,所以用这个函数返回一个路径列表，框架会把列表里的文件(如asdf.png)放进合适的地方，可以用<img src="./assets/asdf.png" />访问
// }

export const getStaticPaths: GetStaticPaths = async () => {
  const routes: SSGRoutes[] = [];
  const postDirPath = path.join(process.cwd(), "posts");
  // post里面可能是 xxx.md 或 xxx/index.md xxx/assets/asdf.png，不嵌套

  // no slash
  const paths: string[] = [];

  const postDir = await fs.opendir(postDirPath);
  for await (const dirent of postDir) {
    if (dirent.isFile()) {
      if (dirent.name.match(/\.md$/)) {
        paths.push(dirent.name.replace(/\.md$/, ""));
      }
    } else if (dirent.isDirectory()) {
      const filePath = path.join(postDirPath, dirent.name, "index.md");
      try {
        await fs.access(filePath);
        paths.push(dirent.name);
      } catch (error) {}
    }
  }

  return paths.map((p) => ({
    path: p,
    getStaticData,
  }));
};

const getStaticData: GetStaticData<BlogStaticData> = async (context) => {
  const renderMarkdown = async (filePath: string): Promise<BlogStaticData> => {
    const mdString = await fs.readFile(filePath, {
      encoding: "utf-8",
    });

    // parse front matter...
    // render to html...
    return {
      metadata: { title: filePath },
      markup: `<code>${mdString}</code>`,
    };
  };

  const filePath = await (async () => {
    const base = path.join(process.cwd(), "posts");
    const postName = context.path.replace(/^.*\//, ""); // i assume there is no trailling slash

    try {
      const file = path.join(base, `${postName}.md`);
      if ((await fs.stat(file)).isFile()) {
        return file;
      }
    } catch (error) {}

    try {
      const file = path.join(base, postName, "index.md");
      if ((await fs.stat(file)).isFile()) {
        return file;
      }
    } catch (error) {}

    throw new Error(
      `I cant find post data for this path (${context.path}).Are you sure getStaticPaths is correct?`
    );
  })();

  return renderMarkdown(filePath);
};
