import summaryToUrlTree from '../src/makeConfig/summaryToUrlTree';
import JSON00 from '../testData/00-JSON.json';
import path from 'path';
import fs from 'fs';
import visit from 'unist-util-visit';
import GithubSlugger from 'github-slugger';
import { UserFunction } from '../src';

//Let the user add a function
const userFunction: UserFunction = (node, { mdast }) => {
  const routePrefix = node.route;
  var slugger = new GithubSlugger();
  let headers: any[] = [];
  visit(mdast, 'heading', (mdNode: any) => {
    if (mdNode.depth === 2) {
      let header: any = {};
      header.title = mdNode.children[0].value;
      header.route = routePrefix + '/#' + slugger.slug(header.title);
      header.type = 'heading';
      headers.push(header);
    }
  });
  node.content = headers;
};

test('Constructs valid URL tree', async () => {
  const localData = path.join(__dirname, '..', 'testData', 'TOC.md');
  const result = await summaryToUrlTree({
    url:
      'https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/TOC.md',
    localPath: localData,
    userFunction: userFunction,
    rawProvider: 'https://raw.githubusercontent.com',
  });
  fs.writeFileSync('hmm.json', JSON.stringify(result));

  expect(result).toEqual(JSON00);
});
