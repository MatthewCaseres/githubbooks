import fs from 'fs';
import unified from 'unified';
import markdown from 'remark-parse';
import visit from 'unist-util-visit';
var { read } = require('to-vfile');

const location =
  'C:\\Users\\matth\\OneDrive\\Documents\\GitHub\\typescript-book\\SUMMARY.md';
const file = await read(path);
let tree = await unified()
  .use(markdown)
  .parse(file);
console.log(mdText);
