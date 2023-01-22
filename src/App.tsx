import React from "react";
import { HelmetProvider, Helmet, ProviderProps } from "react-helmet-async";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./routes";
import Blog from "./routes/blog";
import "highlight.js/styles/github-dark.css"
import "./main.css";
import BlogList from "./routes/bloglist";
import BlogRoll from "./routes/blogroll";
import About from "./routes/about";

export interface AppProps {
  helmetContext?: ProviderProps["context"];
}

// const q = import(`./routes/${"blog"}`);
// q.then(() => console.log("dynamic"));

// clientRoutes: maybe i can use createRoutesFromElements
// todo: check if clientRoutes and ssgRoutes match
// ssgRoutes will be shaked in client build

const App = (props: AppProps) => {
  const location = useLocation();
  // console.log(location.pathname);
  return (
    <HelmetProvider context={props.helmetContext}>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>test</title>
      </Helmet>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blogroll" element={<BlogRoll />} />
        <Route path="/blog/*" element={<Blog />} />
        <Route path="/about" element={<About />} />
        {/* todo: 404 */}
      </Routes>
    </HelmetProvider>
  );
};

export default App;
