import React, { FC } from "react";
import { AiOutlineFolderOpen, AiOutlineTag } from "react-icons/ai";
import { Link } from "react-router-dom";
import { BsBookmark, BsTag } from "react-icons/bs";

export interface ArticleProps {
  link?: string;
  /** @description image */
  preview?: string;
  title: string;
  description?: string;
  category: string;
  date: string;
  tags: string[];
}

export const ArticleCard: FC<ArticleProps> = (props: ArticleProps) => {
  const postLink = props.link ?? "";
  return (
    <div className="bg-bg-secondary">
      {/* 图片 */}
      <Link
        to={postLink}
        className="w-full block aspect-[16/9] bg-[#969b9c]"
      >
        {props.preview && (
          <img src={props.preview} className="object-cover"></img>
        )}
      </Link>

      {/* Card主体 */}
      <div className="h-48 p-4 flex flex-col text-text-secondary">
        <div className="flex-1 mb-1">
          {/* 标题 */}
          <h3 className="text-xl line-clamp-2">
            <Link
              to={postLink}
              className="hover:text-primary font-medium text-text-primary"
            >
              {props.title}
            </Link>
          </h3>

          {/* 简介 */}
          <p className="text-text-secondary line-clamp-2">
            {props.description}
          </p>
        </div>

        {/* 分类&日期 */}
        <div className="flex items-end justify-between mb-1">
          <Link to={""} className="flex items-center mr-4 hover:text-primary">
            <BsBookmark className="mr-1 relative top-[0.0625em]" />
            {props.category}
          </Link>
          {props.date}
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap space-x-2 h-6 overflow-hidden">
          {props.tags.map((text) => (
            <Link
              to={""}
              key={text}
              className="flex items-center hover:text-primary"
            >
              <BsTag className="mr-1 -scale-x-100 relative top-[0.0625em]" />
              {text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
