import React from "react";
import ExternalLink from "./ExternalLink";

const Footer: React.FC = () => {
  return (
    <div className="w-full bg-black/75">
      <footer className="comp-container h-16 py-2 flex justify-between items-center flex-wrap">
        <ExternalLink href="https://github.com/nyonsama">项目地址</ExternalLink>
        <div>Made with React & Tailwindcss</div>
      </footer>
    </div>
  );
};
export default Footer;
