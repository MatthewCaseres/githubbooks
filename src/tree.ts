import yaml from "js-yaml"
import fs from "fs"
import axios from "axios"
import {Node} from "./types"

export type FlatNode = { rawUrl: string; ghUrl: string; route: string; path: string, yamlUrl: string }
export type FlatNodes = FlatNode[]

export async function urlTreeFromYaml(location: string, remote=true) {
  let yamlText: string
  if(remote){
    yamlText = await(await axios.get(location)).data
  } else {
    yamlText = fs.readFileSync(location, 'utf8')
  }
  return yaml.safeLoad(yamlText) as Node;
}

export async function urlRoutes(yamlUrl: string) {
  let root = await urlTreeFromYaml(yamlUrl)
  let paths: FlatNodes = [];
  function dfs(node: Node) {
    if ("rawUrl" in node && "ghUrl" in node && "route" in node && "path" in node) {
      let {rawUrl, ghUrl, route, path} = node
      paths.push({ rawUrl, ghUrl, route, path, yamlUrl } as FlatNode);
    }
    if ("children" in node && node.children) {
      for (let child of node.children) {
        dfs(child)
      }
    }
  }
  dfs(root)
  return paths
}

export async function allUrlRoutes(urls: string[]) {
  let allUrlRoutesList: FlatNodes = []
  for (let yamlUrl of urls) {
    allUrlRoutesList.push(...(await urlRoutes(yamlUrl)))
  }
  return allUrlRoutesList
}

export async function getMdSource(route: string, urls: string[], remote=true) {
  let rawPaths = await allUrlRoutes(urls);
  let rawUrl = rawPaths.find(path => path.route === route)!.rawUrl!
  let localPath = rawPaths.find(path => path.route === route)!.path!
  let source: string
  if (remote) {
    source = await(await axios.get(rawUrl)).data;
  } else {
    source = fs.readFileSync(localPath, 'utf8')
  }
  return source
}

export async function staticPaths(urls: string[]) {
  let rawPaths = await allUrlRoutes(urls);
  return rawPaths.map(path => ({params: {id: path.route.split('/')}}))
}

