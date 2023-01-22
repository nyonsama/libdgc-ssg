import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/** @description 被嵌进script标签里的json数据 */
export interface StaticData {
  path: string;
  data: any;
}

interface StaticDataContextContent {
  // getJsonPath?:(path:string)=>string
  staticData?: StaticData;
  ssr: boolean;
}

// 目的是消除从html获取数据和在服务端获取数据的区别，储存的数据是不可变的初始数据
const StaticDataContext = React.createContext<StaticDataContextContent>({
  ssr: false,
});

export interface StaticDataProviderProps extends React.PropsWithChildren {
  initialData?: StaticData;
  ssr?: boolean;
  // fetcher: (path: string) => Promise<any>;
}

export const StaticDataProvider = (props: StaticDataProviderProps) => {
  return (
    <StaticDataContext.Provider
      value={{ staticData: props.initialData, ssr: props.ssr ?? false }}
    >
      {props.children}
    </StaticDataContext.Provider>
  );
};

export interface StaticDataResponse<T> {
  data?: T;
  error?: {
    reason: "404" | "network";
    originalError?: Error;
  };
  isLoading: boolean;
}

// 仅当在客户端导航的时候使用
export const useStaticData = <T,>(): StaticDataResponse<T> => {
  const location = useLocation();
  const { staticData: initialData, ssr } = useContext(StaticDataContext);
  const [response, setResponse] = useState<StaticDataResponse<T>>({
    isLoading: true,
  });

  // console.log("initialData:", initialData);
  // check if initialData.path matches current path
  let match: boolean;
  if (ssr) {
    // server side
    match = true;
  } else if (initialData?.path === location.pathname) {
    // not doing any navigate yet

    // todo:或许可以改成useLocation
    match = true;
  } else {
    match = false;
  }

  useEffect(() => {
    // if not match, get some data
    if (!match) {
      (async () => {
        try {
          setResponse({ isLoading: true });
          const jsonFileName =
            location.pathname === "/"
              ? "/index.json"
              : location.pathname.replace(/\/$/, "") + ".json";
          // todo: 可能以后要改path
          const res = await fetch(`/_data${jsonFileName}`);
          if (res.ok) {
            setResponse({ isLoading: false, data: await res.json() });
          } else if (res.status === 404) {
            setResponse({ isLoading: false, error: { reason: "404" } });
          } else {
            setResponse({ isLoading: false, error: { reason: "network" } });
          }
        } catch (error) {
          if (error instanceof Error) {
            setResponse({
              error: { reason: "network", originalError: error },
              isLoading: false,
            });
          }
        }
      })();
    }
  }, []);

  if (match) {
    return { data: initialData?.data, isLoading: false };
  }

  return response;
};
