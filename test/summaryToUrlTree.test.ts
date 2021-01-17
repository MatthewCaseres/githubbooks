import {summaryToUrlTree} from '../src/makeConfig/summaryToUrlTree';
import JSON00 from '../testData/00-JSON.json';
import path from 'path';
import fs from 'fs';
import visit from 'unist-util-visit';
import GithubSlugger from 'github-slugger';
import { UserFunction } from '../src';

//Let the user add a function
const userFunction: UserFunction = (node, { mdast, frontMatter }) => {
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
  if (headers.length > 0) {
    node.headers = headers
  }
  if( Object.keys(frontMatter).length > 0) {
    node.frontMatter = frontMatter
  }
};

test('Constructs valid URL tree', async () => {
  const result = await summaryToUrlTree({
    url:
      'https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/TOC.md',
    localPath: path.join(__dirname, '..', 'testData', 'TOC.md'),
    userFunction: userFunction,
    rawProvider: 'https://raw.githubusercontent.com',
  });
  fs.writeFileSync('hmm.json', JSON.stringify(result));

  expect(result).toEqual(JSON00);
});
