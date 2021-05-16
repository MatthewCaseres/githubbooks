// import getContentNodes from './getContentNodes';
import getGhRawUrl from './getGhRawUrl';
import unified from 'unified';
import markdown from 'remark-parse';
import path from 'path';
import axios from 'axios';
import { read } from 'to-vfile';
import gitUrlParse from 'git-url-parse';
import matter from 'gray-matter';

export type TreeNode = {
  type: string;
  title: string;
  children?: TreeNode[];
  path?: string;
  rawUrl?: string;
  [key: string]: any;
};
export type UserFunction = (ctx: {
    treeNode: TreeNode
    mdast: { type: string; [key: string]: any };
    frontMatter: { [key: string]: any };
    file: string
  }
) => void;
export type Config = {
  url: string;
  rawProvider?: string;
  localPath?: string;
  userFunction?: UserFunction;
};

export const summaryToUrlTree: (config: Config) => any = async ({
  url,
  localPath,
  userFunction,
  rawProvider = 'https://raw.githubusercontent.com',
}) => {
  if (!url) {
    throw new Error(`File with has no url for remote loading`);
  }
  const { ghPrefix, rawPrefix, full_name, rawSummaryUrl } = getGhRawUrl(
    url,
    rawProvider
  );
  

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
      if (node.children[0].type === 'text') {
        node.type = 'directory';
        node.title = node.children[0].value;
      } else if (node.children[0].type === 'link') {
        node.type = 'file';
        node.route = node.children[0].url;
        //Links with no link text in AWS docs?
        try{
          node.title = node.children[0].children[0].value;
        } catch (error) {
          console.log(node, error)
        }
      } else if (node.children[0].type === 'strong') {
        node.type = 'separator';
        node.title = node.children[0].children[0].value;
      }
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
        ['file', 'directory'].includes(children[i].type) &&
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
      if (node.route.startsWith('https://github.com')) {
        const gh = gitUrlParse(node.route);
        node.ghUrl = node.route;
        node.route = gh.full_name + '/' + gh.filepath;
        node.rawUrl = gh.href
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('blob/', '');
      } else {
        //relative path allows support for local development
        if (localPath !== undefined) {
          node.path = path.join(path.parse(localPath).dir, node.route);
        }
        node.rawUrl = rawPrefix + node.route;
        node.ghUrl = ghPrefix + node.route;
        node.route = full_name + '/' + node.route;
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

  const dfsUserFunction = async (node: TreeNode, userFunc: UserFunction) => {
    let file: string | undefined;
    if (node.path) {
      const vfile = await read(node.path as string);
      file = vfile.toString();
    } else if (node.rawUrl) {
      file = await (await axios.get(node.rawUrl)).data;
    }
    if (file) {
      const { content: md, data: frontMatter } = matter(file);
      let mdast = unified()
        .use(markdown)
        .parse(md);
      userFunc({treeNode: node, mdast, frontMatter, file });
    }
    if (node.children) {
      for (let child of node.children) {
        await dfsUserFunction(child, userFunc);
      }
    }
  };
  if (userFunction) {
    await dfsUserFunction(tree, userFunction);
  }

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

  tree.type = 'root';
  return tree;
};
