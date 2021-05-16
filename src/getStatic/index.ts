import fs from 'fs';
import axios from 'axios';

export type UrlNode = {
  type: string;
  title: string;
  treePath: readonly number[];
  rawUrl?: string;
  path?: string;
  route?: string;
  ghUrl?: string;
  name?: string;
  id?: string;
  children?: UrlNode[];
  extension?: string;
};

export type FlatNode = {
  treePath: number[];
  rawUrl: string;
  ghUrl: string;
  route: string;
  path: string;
  title: string;
  next?: {title: string, route: string};
  prev?: {title: string, route: string};
  index: number;
};
export type FlatNodes = FlatNode[];

export function getAllRoutesInfo(urlTrees: UrlNode[]) {
  let allRawRoutes: Partial<Record<string, FlatNode>> = {};
  for (let i = 0; i < urlTrees.length; i++) {
    allRawRoutes = {
      ...allRawRoutes,
      ...getRoutesInfo(urlTrees[i], i),
    };
  }
  return allRawRoutes;
}

//this gets the yaml raw url paired up with it's tree representation
export async function getYamlUrlTree(location: string) {
  return fs.readFileSync(location, 'utf8');
}
//this gets the route paired up with all the info you might want about it.
export function getRoutesInfo(root: UrlNode, index: number) {
  let paths: FlatNodes = [];
  function dfs(node: UrlNode) {
    if ('rawUrl' in node) {
      let { title, rawUrl, ghUrl, route, path, treePath } = node;
      paths.push({ title, rawUrl, ghUrl, route, path, index, treePath } as FlatNode);
    }
    for (let child of node.children ?? []) {
      dfs(child);
    }
  }
  dfs(root);
  for (let i = 1; i < paths.length; i++) {
    paths[i].prev = {title: paths[i-1].title, route: paths[i-1].route}
    paths[i-1].next = {title: paths[i].title, route: paths[i].route}
  }
  return paths.reduce<Record<string, FlatNode>>((a, b) => {
    a[b.route] = b;
    return a;
  }, {});
}

export async function getMdSource(
  {rawUrl, path: localPath}: FlatNode,
  local?: boolean
) {
  let source: string;
  if (local && localPath !== undefined) {
    source = fs.readFileSync(localPath, 'utf8');
  } else {
    source = await (await axios.get(rawUrl)).data;
  }
  return source;
}
