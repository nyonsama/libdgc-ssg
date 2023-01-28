import { useEffect, useState } from "react";
import { BsBookmark, BsCalendar4, BsTag } from "react-icons/bs";
import { useLoaderData } from "react-router-dom";
import Footer from "../components/Footer";
import InlineIcon from "../components/InlineIcon";
import NavBar from "../components/NavBar";
import { BlogPostData, TocEntry } from "../frame/markdown";
import classNames from "classnames";

const Toc = (props: { toc: TocEntry[]; activeId?: string }) => {
  return (
    <div className="relative max-h-[calc(100vh-var(--navbar-height)-2rem-var(--footer-height))] min-w-[8rem] overflow-auto">
      <h2 className="mb-2 text-lg text-text-600 font-medium">目录</h2>
      <hr className="border-t border-solid border-text-800" />
      <ul>
        {props.toc.map((toc) => {
          const active = props.activeId === toc.id ? "toc-active" : "";
          return (
            <li
              key={toc.id}
              style={{ marginLeft: `${(toc.level - 2) * 0.5}rem` }}
              className="mb-2"
            >
              <a
                className={`text-sm text-text-secondary hover:underline ${active}`}
                href={"#" + encodeURIComponent(toc.id)}
              >
                {toc.content}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Blog = () => {
  const [activeTocId, setActiveTocId] = useState<string>("");
  const data = useLoaderData() as BlogPostData;

  useEffect(() => {
    // 检测显示在视口中的元素，设置activeTocId
    const postBody = document.querySelector(".post")!;
    const elements = Array.from(
      postBody.querySelectorAll("h2, h2 ~ *, h3, h3 ~ *")
    ).filter((e) => e.id !== "目录");

    const idByElement = new Map<Element, string>();
    let lastId = "";
    for (const elem of elements) {
      if (elem.id) {
        idByElement.set(elem, elem.id);
        lastId = elem.id;
      } else {
        idByElement.set(elem, lastId);
      }
    }

    const elementsVisiability = new Map<Element, boolean>(
      elements.map((e) => [e, false])
    );

    const navbarHeight = getComputedStyle(document.querySelector(":root")!)
      .getPropertyValue("--navbar-height")
      .trim();

    const observer = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          elementsVisiability.set(entry.target, entry.isIntersecting);
        }

        let [firstVisiable] = Array.from(elementsVisiability.entries()).filter(
          ([, v]) => v
        )[0];

        if (firstVisiable) {
          setActiveTocId(idByElement.get(firstVisiable) ?? "");
        } else {
          setActiveTocId("");
        }
      },
      { threshold: [0.0, 1.0], rootMargin: `-${navbarHeight} 0px 0px 0px` }
    );

    for (const h of elements) {
      observer.observe(h);
    }

    return () => {
      observer.disconnect();
    };
  }, [data, setActiveTocId]);

  const timeString = new Date(data.frontMatter.ctime).toLocaleString("zh-CN");
  const category = data.frontMatter.category;

  return (
    <>
      <NavBar />
      <div className="page-container mt-4 mb-16 flex-1">
        <div className="w-full aspect-[16/9] max-w-2xl bg-text-secondary mb-4"></div>
        <div className="text-text-secondary mb-2 space-x-4">
          <span>
            <InlineIcon>
              <BsCalendar4 className="mr-1 -scale-x-100" />
            </InlineIcon>
            {timeString}
          </span>
          <span>
            <InlineIcon>
              <BsBookmark className="mr-1 -scale-x-100" />
            </InlineIcon>
            {category}
          </span>
        </div>
        <div className="text-text-secondary space-x-2 mb-12">
          {data.frontMatter.tags.map((tag) => (
            <span key={tag}>
              <InlineIcon>
                <BsTag className="mr-1 -scale-x-100" />
              </InlineIcon>
              {tag}
            </span>
          ))}
        </div>
        <div className="relative">
          <div
            className={classNames(
              "prose prose-invert",
              "prose-headings:text-text-200 prose-a:text-primary prose-a:no-underline text-text-primary prose-blockquote:text-text-primary",
              "max-w-2xl",
              "post"
            )}
            dangerouslySetInnerHTML={{ __html: data.markup }}
          ></div>
          <div className="absolute inset-y-0 right-0 max-lg:hidden">
            <div className="sticky top-24 toc-side">
              <Toc toc={data.toc} activeId={activeTocId} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Blog;
