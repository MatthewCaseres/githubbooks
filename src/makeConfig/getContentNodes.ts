import unified from 'unified';
import markdown from 'remark-parse';
import GithubSlugger from 'github-slugger';
import visit from 'unist-util-visit';
import { read } from 'to-vfile';
import yaml from 'js-yaml';
import axios from 'axios';

export default async function getContentNodes(fileNode: any) {
  let file: string;
  if (fileNode.path) {
    file = await read(fileNode.path);
  } else {
    file = await (await axios.get(fileNode.rawUrl)).data;
  }
  let tree = unified()
    .use(markdown)
    .parse(file);
  var slugger = new GithubSlugger();
  const routePrefix = fileNode.route;
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
  let problems: any[] = [];
  let problemCount = 1;
  visit(tree, 'code', (node: any) => {
    if (node.lang?.includes('edtech')) {
      let problemData = yaml.safeLoad(node.value) as any;
      if (!problemData.id) {
        throw new Error('There is no ID on your edtech component');
      }
      let problem = {
        type: node.lang,
        title: `problem ${problemCount}`,
        id: problemData.id,
        route: routePrefix + '/#' + problemData.id,
      };
      problemCount += 1;
      if (problem.id) {
        problems.push(problem);
      }
    }
  });
  return [...headers, ...problems];
}
