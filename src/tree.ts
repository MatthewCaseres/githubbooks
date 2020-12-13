import yaml from 'js-yaml';
import fs from 'fs';
import axios from 'axios';
import { Node } from './types';

export type FlatNode = {
  rawUrl: string;
  ghUrl: string;
  route: string;
  path: string;
  yamlUrl: string;
};
export type FlatNodes = FlatNode[];

export async function urlTreeFromYaml(location: string, remote = true) {
  let yamlText: string;
  if (remote) {
    yamlText = await (await axios.get(location)).data;
  } else {
    yamlText = fs.readFileSync(location, 'utf8');
  }
  return yaml.safeLoad(yamlText) as Node;
}

export async function getYamlUrlTree(yamlUrls: string[]) {
  let pathsWithTrees: Record<string, Node> = {};
  for (let yamlUrl of yamlUrls) {
    pathsWithTrees[yamlUrl] = await urlTreeFromYaml(yamlUrl);
  }
  return pathsWithTrees;
}

export async function getRawRoutes(yamlUrl: string) {
  let root = await urlTreeFromYaml(yamlUrl);
  let paths: FlatNodes = [];
  function dfs(node: Node) {
    if ('rawUrl' in node) {
      let { rawUrl, ghUrl, route, path } = node;
      paths.push({ rawUrl, ghUrl, route, path, yamlUrl } as FlatNode);
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

export async function getAllRawRoutes(yamlUrls: string[]) {
  let allRawRoutes: Record<string, FlatNode> = {};
  for (let yamlUrl of yamlUrls) {
    allRawRoutes = { ...allRawRoutes, ...(await getRawRoutes(yamlUrl)) };
  }
  return allRawRoutes;
}

export async function getMdSource(
  route: string,
  allRawRoutes: Record<string, FlatNode>,
  remote = true
) {
  let rawUrl = allRawRoutes[route].rawUrl;
  let localPath = allRawRoutes[route].path;
  let source: string;
  if (remote) {
    source = await (await axios.get(rawUrl)).data;
  } else {
    source = fs.readFileSync(localPath, 'utf8');
  }
  return source;
}
