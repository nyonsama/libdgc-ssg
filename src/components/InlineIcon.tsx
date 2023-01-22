import React, { FC } from "react";

interface InlineIconProps extends React.PropsWithChildren {}

/**
 * @description 用这个把svg图标包起来，实现图标与文字对齐
 */
const InlineIcon: FC<InlineIconProps> = (props: InlineIconProps) => {
  return (
    <span className="inline-flex items-center">
      {"\u200b" /* ZWSP(zero-width space) */}
      {props.children}
    </span>
  );
};

export default InlineIcon;
