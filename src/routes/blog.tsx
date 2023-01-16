import React, { useEffect } from "react";
import { useStaticData } from "../context/StaticDataContext";
import { BlogPostData } from "../frame/markdown";

const Blog = () => {
  const { data, isLoading, error } = useStaticData<BlogPostData>();
  // useEffect(() => {
  //   console.log("data:", data);
  //   console.log("isLoading:", isLoading);
  //   console.log("error:", error);
  // });
  return (
    <div>
      <h1>Blog</h1>
      <p>i render some markdown or something</p>
      <div
        dangerouslySetInnerHTML={{ __html: data?.markup ?? "nothing" }}
      ></div>
      <pre>
        <code>{JSON.stringify(data, undefined, 2)}</code>
      </pre>
    </div>
  );
};

export default Blog;
