import React, { FC } from "react";
import { Helmet } from "react-helmet-async";

const GlobalHeads: FC = () => {
  return (
    <Helmet>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>libdgc</title>
    </Helmet>
  );
};

export default GlobalHeads;
