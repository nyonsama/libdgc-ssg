import React, { useEffect } from "react";
import { useStaticData } from "../context/StaticDataContext";

export interface BlogStaticData {
  metadata: { title: string };
  markup: string;
}

const Blog = () => {
  const { data, isLoading, error } = useStaticData();
  useEffect(() => {
    console.log("data:", data);
    console.log("isLoading:", isLoading);
    console.log("error:", error);
  });
  return (
    <div>
      <h1>Blog</h1>
      <p>i render some markdown or something</p>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
};

export default Blog;
