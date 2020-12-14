import yaml from 'js-yaml';
import fs from 'fs';
import axios from 'axios';
import { UrlNode } from './types';

export type FlatNode = {
  rawUrl: string;
  ghUrl: string;
  route: string;
  path: string;
  yamlUrl: string;
};
export type FlatNodes = FlatNode[];

export async function urlTreeFromYaml(location: string, remote: boolean) {
  let yamlText: string;
  if (remote) {
    yamlText = await (await axios.get(location)).data;
  } else {
    yamlText = fs.readFileSync(location, 'utf8');
  }
  return yaml.safeLoad(yamlText) as UrlNode;
}

//this gets the yaml raw url paired up with it's tree representation
export async function getYamlUrlTree(yamlUrls: string[], remote: boolean) {
  let pathsWithTrees: Record<string, UrlNode> = {};
  for (let yamlUrl of yamlUrls) {
    pathsWithTrees[yamlUrl] = await urlTreeFromYaml(yamlUrl, remote);
  }
  return pathsWithTrees;
}

//this gets the route paired up with all the info you might want about it.
export async function getRawRoutes(yamlUrl: string, remote: boolean) {
  let root = await urlTreeFromYaml(yamlUrl, remote);
  let paths: FlatNodes = [];
  function dfs(node: UrlNode) {
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

export async function getAllRawRoutes(yamlUrls: string[], remote: boolean) {
  let allRawRoutes: Record<string, FlatNode> = {};
  for (let yamlUrl of yamlUrls) {
    allRawRoutes = {
      ...allRawRoutes,
      ...(await getRawRoutes(yamlUrl, remote)),
    };
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
