import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { StaticDataProvider } from "./context/StaticDataContext";

let container = document.querySelector("#root");
if (!container) {
  container = document.createElement("div");
  document.querySelector("body")?.appendChild(container);
}

const staticData = (() => {
  const dataElement = document.querySelector("#__MY_DATA__");
  if (dataElement?.textContent) {
    return JSON.parse(dataElement.textContent);
  }
})();

const elements = (
  <BrowserRouter>
    <StaticDataProvider initialData={staticData}>
      <App />
    </StaticDataProvider>
  </BrowserRouter>
);

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === "production") {
  ReactDOM.hydrateRoot(container, elements);
} else {
  const root = ReactDOM.createRoot(container);
  root.render(elements);
}
