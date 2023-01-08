import React from "react";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import Asdf from "./asdf";
import Blog from "./blog";

const Home = () => {
  return (
    <>
      <h1>Home</h1>
      <Link to={"/blog/first"}>first</Link>
    </>
  );
};

export default Home;
