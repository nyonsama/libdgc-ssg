import React from "react";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import { useStaticData } from "../context/StaticDataContext";
import Asdf from "./asdf";
import Blog from "./blog";
import { HomeStaticData } from "./index.server";

interface PostListProps {
  data: HomeStaticData;
}
const PostList: React.FC<PostListProps> = (props: PostListProps) => {
  const data = props.data;
  return (
    <>
      {data.posts.map((p) => (
        <div key={p.id}>
          <Link to={`./blog/${p.id}/`}>{p.frontMatter.title}</Link>
          <div>{p.frontMatter.description}</div>
        </div>
      ))}
    </>
  );
};

const Home = () => {
  const { data, isLoading, error } = useStaticData<HomeStaticData>();
  let comp = <></>;
  if (isLoading) {
    comp = <p>loading</p>;
  } else if (error) {
    comp = <p>error</p>;
  } else if (data) {
    comp = (
      <>
        <PostList data={data} />
        <pre>
          <code>{JSON.stringify(data, undefined, 2)}</code>
        </pre>
      </>
    );
  }
  return (
    <>
      <h1>Home!</h1>
      {/* <Link to={"/blog/first"}>first</Link> */}
      {comp}
    </>
  );
};

export default Home;
