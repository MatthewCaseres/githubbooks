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
  treeNode: TreeNode;
  mdast: { type: string; [key: string]: any };
  frontMatter: { [key: string]: any };
  file: string;
}) => void;
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
  /**
   * Function
   * @param node
   */
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
        try {
          node.title = node.children[0].children[0].value;
        } catch (error) {
          console.log(node, error);
        }
      } else if (node.children[0].type === 'strong') {
        node.type = 'separator';
        node.title = node.children[0].children[0].value;
      }
      delete node.children;
      delete node.position;
    }
  };
  /**
   *
   * @param node
   */
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
  /**
   *
   * @param node
   * @returns
   */
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
  /**
   *
   * @param node
   * @param userFunc
   */
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
      userFunc({ treeNode: node, mdast, frontMatter, file });
    }
    if (node.children) {
      for (let child of node.children) {
        await dfsUserFunction(child, userFunc);
      }
    }
  };
  /**
   *
   * @param node
   * @param treePath
   */
  const dfsAddPaths = (node: any, treePath: number[]) => {
    node.treePath = treePath;
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        let newPath = [...treePath, i];
        dfsAddPaths(node.children[i], newPath);
      }
    }
  };

  //Error Checking
  if (!url) {
    throw new Error(`File with has no url for remote loading`);
  }
  //Getting URL for Raw Data
  const { ghPrefix, rawPrefix, full_name, rawSummaryUrl } = getGhRawUrl(
    url,
    rawProvider
  );

  //Get md file data
  let file;
  if (!localPath) {
    file = await (await axios.get(rawSummaryUrl)).data;
  } else {
    file = await read(localPath);
  }

  //Parse md file into objects
  const root = unified()
    .use(markdown)
    .parse(file) as any;

  let trees = [];

  for (let i = 0; i < root.children.length; i++) {
    const title = root.children[i].children[0].value;

    //New title found - indicates a new tree
    //*It's possible that a heading doesn't have a corresponding list
    //* the opposite isn't supported - Must have at least 1 title
    if (title) {
      //Grab the following child (check type list) and increment counter
      const tree = root.children[i + 1];

      //If heading w/o a tree, move on
      if (tree && tree.type != 'heading') {
        i++;
      } else {
        continue;
      }

      //Prune tree
      delete tree.spread;
      delete tree.ordered;
      delete tree.start;
      delete tree.position;

      //Add tree
      tree.title = title;
      trees.push(tree);
    }
  }

  //Iterate though all trees
  for (let i = 0; i < trees.length; i++) {
    dfsRemoveListItem(trees[i]);
    dfsRemoveList(trees[i]);
    await dfsAddContents(trees[i]);
    if (userFunction) {
      await dfsUserFunction(trees[i], userFunction);
    }
    dfsAddPaths(trees[i], []);
    trees[i].type = 'root';
  }

  return trees;
};
