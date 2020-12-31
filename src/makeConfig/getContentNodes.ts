import unified from 'unified';
import markdown from 'remark-parse';
import GithubSlugger from 'github-slugger';
import visit from 'unist-util-visit';
import { read } from 'to-vfile';
import yaml from 'js-yaml';
import axios from 'axios';

export default async function getContentNodes(fileNode: any, isLocal: boolean) {
  var slugger = new GithubSlugger();
  const routePrefix = fileNode.route;
  let file: string;
  if (!isLocal) {
    file = await (await axios.get(fileNode.rawUrl)).data;
  } else {
    file = await read(fileNode.path);
  }
  let tree = unified()
    .use(markdown)
    .parse(file);
  let headers: any[] = [];
  visit(tree, 'heading', (node: any) => {
    const idRegex = /_id=([0-9A-Fa-f-]*)\s*$/;
    if (node.depth === 2 && !node.children[0].value.includes('_ignore')) {
      let headerMatch = node.children[0].value.match(idRegex);
      let header: any = {};
      if (headerMatch) {
        header.id = headerMatch[1];
        header.title = node.children[0].value.replace(idRegex, '');
      } else {
        header.title = node.children[0].value;
      }
      header.route = routePrefix + '/#' + slugger.slug(header.title);
      header.type = 'heading';
      headers.push(header);
    }
  });
  let children: any[] = [];
  visit(tree, 'code', (node: any) => {
    if (node.lang?.includes('edtech')) {
      let problemData = yaml.safeLoad(node.value) as any;
      let problem = {
        type: node.lang,
        ...(problemData.id ? { id: problemData.id } : {}),
      };
      if (problem.id) {
        children.push(problem);
      }
    }
  });
  let problems = children.length
    ? [{ type: 'heading', title: 'Problems', children }]
    : [];
  return [...headers, ...problems];
}
