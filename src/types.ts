export type Node = {
  type: string;
  title: string;
  rawUrl?: string;
  path?: string;
  route?: string;
  ghUrl?: string;
  name?: string;
  id?: string;
  children?: Node[];
  extension?: string;
};
