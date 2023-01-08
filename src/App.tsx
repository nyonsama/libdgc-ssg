import React from "react";
import { HelmetProvider, Helmet, ProviderProps } from "react-helmet-async";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./routes";
import Asdf from "./routes/asdf";
import Blog from "./routes/blog";

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
  console.log(location.pathname);
  return (
    <HelmetProvider context={props.helmetContext}>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>test</title>
      </Helmet>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/asdf" element={<Asdf />} />
        <Route path="/blog" element={<h1>Blog Index</h1>} />
        <Route path="/blog/*" element={<Blog />} />
      </Routes>
    </HelmetProvider>
  );
};

export default App;
