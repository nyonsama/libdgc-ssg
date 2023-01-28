import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import {
  BrowserRouter,
  createBrowserRouter,
  LoaderFunction,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import { staticDataLoader } from "./frame";
import Home from "./routes";
import About from "./routes/about";
import Blog from "./routes/blog";
import BlogList from "./routes/bloglist";
import BlogRoll from "./routes/blogroll";
import "highlight.js/styles/github-dark.css";
import "./main.css";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
    loader: staticDataLoader,
  },
  {
    path: "/blog/",
    element: <BlogList />,
    loader: staticDataLoader,
  },
  { path: "/blogroll", element: <BlogRoll /> },
  { path: "/about", element: <About /> },
  {
    path: "/blog/:blogId",
    element: <Blog />,
    loader: staticDataLoader,
  },
];

const router = createBrowserRouter(routes);

const elements = (
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>
);

console.log(process.env.NODE_ENV);

let container = document.querySelector("#root");
if (!container) {
  container = document.createElement("div");
  document.querySelector("body")?.appendChild(container);
}
ReactDOM.hydrateRoot(container, elements);
