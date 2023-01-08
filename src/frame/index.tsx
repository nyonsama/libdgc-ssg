export interface GetStaticDataContext {
  /** @description equals to `location.pathname` in browser */
  path: string;
  // 有必要的话可以把querystring也加进来
}
export type GetStaticData<T> = (context: GetStaticDataContext) => Promise<T>;

export interface SSGRoutes {
  path: string;
  getStaticData?: GetStaticData<any>;
  children?: SSGRoutes[] | (() => Promise<SSGRoutes[]>);
}

export type GetStaticPaths = () => Promise<SSGRoutes[]>;
