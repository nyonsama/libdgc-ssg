import React from "react";
import { Link } from "react-router-dom";

const NavBar: React.FC = () => {
  return (
    <>
      <div className="sticky inset-x-0 top-0 h-16 z-20 bg-black/75">
        <nav className="page-container flex items-center h-full">
          <div className="flex flex-1">
            {/* <div className="mr-4">icon</div> */}
            <a href="/">libdgc.club</a>
          </div>
          <div className="flex space-x-4 text-text-secondary">
            <Link to="/" className="hover:text-primary">
              首页
            </Link>
            <Link to="/blog" className="hover:text-primary">
              全部文章
            </Link>
            <Link to="/blogroll" className="hover:text-primary">
              友链
            </Link>
            <Link to="/about" className="hover:text-primary">
              关于
            </Link>
          </div>
        </nav>
      </div>
      {/* <div className="h-16"></div> */}
    </>
  );
};
export default NavBar;
