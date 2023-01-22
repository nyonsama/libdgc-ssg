import React from "react";
import { BiLinkExternal } from "react-icons/bi";
import { BsBoxArrowUpRight } from "react-icons/bs";
import InlineIcon from "./InlineIcon";

export interface ExternalLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const ExternalLink = (props: ExternalLinkProps) => {
  const { children, className, ...rest } = props;
  return (
    <a {...rest} className={`hover:underline ${className}`}>
      {children}
      <InlineIcon>
        <BsBoxArrowUpRight className="ml-1" />
      </InlineIcon>
    </a>
  );
};

export default ExternalLink;
