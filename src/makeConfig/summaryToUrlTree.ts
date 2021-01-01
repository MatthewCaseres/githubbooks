import getContentNodes from './getContentNodes';
import getGhRawUrl from './getGhRawUrl';
import unified from 'unified';
import markdown from 'remark-parse';
import path from 'path';
import axios from 'axios';
import { read } from 'to-vfile';

const summaryToUrlTree: (config: any, rawProvider: any) => any = async (
  { url, localPath, removeHeadings },
  rawProvider
) => {
  const { ghPrefix, rawPrefix, full_name, rawSummaryUrl } = getGhRawUrl(
    url,
    rawProvider
  );
  if (!url) {
    throw new Error(`File with has no url for remote loading`);
  }

  let file;
  if (!localPath) {
    file = await (await axios.get(rawSummaryUrl)).data;
  } else {
    file = await read(localPath);
  }

  const root = unified()
    .use(markdown)
    .parse(file) as any;
  const title = root.children[0].children[0].value;
  const tree = root.children[1];
  tree.title = title;

  delete tree.spread;
  delete tree.ordered;
  delete tree.start;
  delete tree.position;

  const dfsRemoveListItem = (node: any) => {
    if (node.type === 'list') {
      node.children = node.children.reduce(
        (childsChildrens: any, liNode: any) => [
          ...childsChildrens,
          ...liNode.children,
        ],
        []
      );
      for (let child of node.children) {
        dfsRemoveListItem(child);
      }
    } else if (node.type === 'paragraph') {
      node.type = 'file';
      node.route = node.children[0].url;
      node.title = node.children[0].children[0].value;
      delete node.children;
      delete node.position;
    }
  };
  dfsRemoveListItem(tree);

  const dfsRemoveList = (node: any) => {
    let children = node.children;
    let i = 0;
    while (i < children.length) {
      if (
        children[i].type === 'file' &&
        i < children.length - 1 &&
        children[i + 1].type === 'list'
      ) {
        children[i].children = children[i + 1].children;
        children.splice(i + 1, 1);
        dfsRemoveList(children[i]);
      }
      i++;
    }
  };
  dfsRemoveList(tree);

  const dfsAddContents = async (node: any) => {
    if (node.route && node.type === 'file') {
      if (localPath !== undefined) {
        node.path = path.join(path.parse(localPath).dir, node.route);
      }
      node.rawUrl = rawPrefix + node.route;
      node.ghUrl = ghPrefix + node.route;
      node.route = full_name + '/' + node.route;
      if (!removeHeadings) {
        let contentNodes = await getContentNodes(node, localPath !== undefined);
        if (contentNodes.length) {
          node.children = contentNodes;
        }
      }
    }
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        node.children[i] = await dfsAddContents(node.children[i]);
      }
    }
    return node;
  };
  await dfsAddContents(tree);

  const dfsAddPaths = (node: any, treePath: number[]) => {
    node.treePath = treePath;
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        let newPath = [...treePath, i];
        dfsAddPaths(node.children[i], newPath);
      }
    }
  };
  dfsAddPaths(tree, []);

  tree.type = 'directory';
  return tree;
};

export default summaryToUrlTree;
