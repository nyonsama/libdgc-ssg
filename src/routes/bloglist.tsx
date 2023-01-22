import React, { FC } from "react";
import ArticleCard from "../components/ArticleCard";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import { useStaticData } from "../frame/context/StaticDataContext";
import { BlogListStaticData } from "./bloglist.server";

// todo 最多显示24个，多出来的翻页

const BlogList: FC = () => {
  const { isLoading, data, error } = useStaticData<BlogListStaticData>();
  const cards = data?.posts.map(({ id, frontMatter: matter }) => {
    return (
      <ArticleCard
        key={id}
        // todo 不写死link
        link={`/blog/${id}/`}
        preview={matter.preview}
        title={matter.title}
        description={matter.description}
        category={matter.category}
        date={new Date(matter.ctime).toLocaleDateString("zh-CN")}
        tags={matter.tags}
      />
    );
  });
  return (
    <>
      <NavBar />
      <div className="comp-container flex-1">
        {/* 近期文章 */}
        <header className="my-16 flex flex-col items-center">
          <h2 className="text-4xl mb-4">全部文章</h2>
          <p className="text-text-secondary text-center">
            发现，想法，学习，记录，胡言乱语
            <br />
            <span className="line-through">还只有这点</span>
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max mb-16">
          {cards}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BlogList;
