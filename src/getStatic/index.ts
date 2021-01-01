import fs from 'fs';
import axios from 'axios';

export type UrlNode = {
  type: string;
  title: string;
  treePath: readonly number[],
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
  index: number;
};
export type FlatNodes = FlatNode[];

export function getAllRoutesInfo(urlTrees: UrlNode[]) {
  let allRawRoutes: Record<string, FlatNode> = {};
  for (let i = 0; i < urlTrees.length; i++) {
    allRawRoutes = {
      ...allRawRoutes,
      ...(getRoutesInfo(urlTrees[i], i)),
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
      let { rawUrl, ghUrl, route, path, treePath } = node;
      paths.push({ rawUrl, ghUrl, route, path, index, treePath } as FlatNode);
    }
    if ('children' in node && node.children) {
      for (let child of node.children) {
        dfs(child);
      }
    }
  }
  dfs(root);
  return paths.reduce<Record<string, FlatNode>>((a, b) => {
    a[b.route] = b;
    return a;
  }, {});
}

export async function getMdSource(
  route: string,
  allRawRoutes: Record<string, FlatNode>,
  remote = true
) {
  let rawUrl = allRawRoutes[route].rawUrl;
  let localPath = allRawRoutes[route].path;
  let source: string;
  if (!remote && localPath !== undefined) {
    source = fs.readFileSync(localPath, 'utf8');
  } else {
    source = await (await axios.get(rawUrl)).data;
  }
  return source;
}
