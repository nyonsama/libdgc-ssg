export interface GetStaticDataContext {
  /** @description equals to `location.pathname` in browser */
  path: string;
  // 有必要的话可以把querystring也加进来
}
export type GetStaticData<T> = (context: GetStaticDataContext) => Promise<T>;

// todo: 可以考虑加个index:boolean，或者手动给path加trailling slash
type RouteInfo =
  | {
      type: "page";
      getStaticData?: GetStaticData<any>;
      children?: SSGRoutes[] | (() => Promise<SSGRoutes[]>);
    }
  | {
      type: "dummy";
      children?: SSGRoutes[] | (() => Promise<SSGRoutes[]>);
    }
  | {
      type: "asset";
      dirPath: string;
    };

export type SSGRoutes = {
  path: string;
  // children?: SSGRoutes[] | (() => Promise<SSGRoutes[]>);
} & RouteInfo;

export type GetStaticPaths = () => Promise<SSGRoutes[]>;
