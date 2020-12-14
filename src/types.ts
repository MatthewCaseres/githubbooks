export type UrlNode = {
  type: string;
  title: string;
  rawUrl?: string;
  path?: string;
  route?: string;
  ghUrl?: string;
  name?: string;
  id?: string;
  children?: UrlNode[];
  extension?: string;
};
