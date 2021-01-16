import summaryToUrlTree from './summaryToUrlTree';
import {Node} from 'unist'

export type TreeNode = {
  type: string
  title: string
  children?: TreeNode[];
  path?: string;
  rawUrl?: string;
  [key: string]: any;
};
export type UserFunction = (
  tree: TreeNode,
  fileContents: { mdast: Node; frontMatter: {[key: string]: any} }
) => void;
export type Config = {
  url: string;
  rawProvider?: string;
  localPath?: string;
  userFunction?: UserFunction
};
export type AllConfigs = Config[];


export async function summariesToTrees(
  configs: AllConfigs,
) {
  return Promise.all(
    configs.map(config => summaryToUrlTree(config))
  )
}
