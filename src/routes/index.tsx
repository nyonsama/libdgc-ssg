import React, { FC } from "react";
import { Link } from "react-router-dom";
import { useStaticData } from "../frame/context/StaticDataContext";
import { HomeStaticData } from "./index.server";
import homeBg from "../assets/home.png"; // 这张图不完美
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { MdArrowForward } from "react-icons/md";
import ArticleCard from "../components/ArticleCard";
import { BsGithub } from "react-icons/bs";
import avatar from "../assets/avatar.jpg";

interface PostListProps {
  data: HomeStaticData;
}
const PostList: React.FC<PostListProps> = (props: PostListProps) => {
  const data = props.data;
  return (
    <>
      {data.posts.map((p) => (
        <div key={p.id}>
          <Link
            to={`./blog/${p.id}/`}
            style={{
              textDecoration: "underline",
            }}
          >
            {p.frontMatter.title}
          </Link>
          <div>{p.frontMatter.description}</div>
        </div>
      ))}
    </>
  );
};

/*
.theme {
  color: #4483cc;
  background-color: #001519;
}
*/

const FancyThing: React.FC = () => {
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-between">
      {/* <div>i am a fancy thing</div>
      <div>i am another fancy thing</div>
      <div>i am also a fancy thing</div> */}
    </div>
  );
};

const Header: React.FC = () => {
  return (
    <header className="w-full h-[30rem] border-2 border-solid border-primary relative overflow-auto mb-16">
      <div className="flex flex-col justify-center items-center h-full absolute inset-0 z-10">
        <h1 className="text-5xl mb-4">libdgc.club</h1>
        <p className="text-xl">杂七杂八</p>
      </div>
      <div className="absolute inset-0">
        <FancyThing />
      </div>
    </header>
  );
};

const AboutMe: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-16">
      <h2 className="text-4xl mb-4">关于我</h2>
      <img
        alt="avatar"
        src={avatar}
        className="w-24 h-24 border-2 border-solid border-primary rounded-full mb-4"
      />
      <div className="text-xl mb-2">ivnm</div>
      <div className="text-center text-text-secondary mb-4">
        人类，前端新人，Rustacean，Linux user，retro gamer，Nintendo nerd
      </div>
      <div className="flex justify-center">
        <a href="https://github.com/nyonsama" className="text-2xl">
          <BsGithub />
        </a>
      </div>
    </div>
  );
};

// todo 搜索，放进一个modal里

const Home = () => {
  const { data, isLoading, error } = useStaticData<HomeStaticData>();
  let cards = <></>;
  if (isLoading) {
    cards = <p>loading</p>;
  } else if (error) {
    cards = <p>error</p>;
  } else if (data) {
    cards = (
      <>
        {data.posts
          .sort(
            (a, b) =>
              Date.parse(b.frontMatter.ctime) - Date.parse(a.frontMatter.ctime)
          )
          .slice(0, 6)
          .map(({ id, frontMatter: matter }) => {
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
          })}
      </>
    );
  }
  return (
    <div>
      <NavBar />
      <div className="comp-container mt-4">
        <Header />

        {/* 近期文章 */}
        <header className="mb-16 flex flex-col items-center">
          <h2 className="text-4xl mb-4">近期文章</h2>
          <p className="mb-4 text-text-secondary">
            发现，想法，学习，记录，胡言乱语
          </p>
          <Link
            to="/blog"
            className="flex items-center align-middle hover:bg-bg-secondary active:bg-primary-900 hover:no-underline px-3 py-1.5 border-2 border-solid border-primary"
          >
            查看全部
            {/* todo: 检查对齐 */}
            <MdArrowForward className="ml-1 text-[22px] -mr-1" />
          </Link>
        </header>
        {/* 文章列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max mb-16">
          {cards}
        </div>
        <AboutMe />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
