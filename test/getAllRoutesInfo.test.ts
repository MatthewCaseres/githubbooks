import { getAllRoutesInfo } from '../src/getStatic';
import jsons from '../testData/00-JSONs.json'
import fs from 'fs'

test('works for FP guide (root config, same level)', () => {
  const res = getAllRoutesInfo(jsons);
  fs.writeFileSync('lol.json', JSON.stringify(res))
  expect(res).toEqual({
    "Open-EdTech/next-mdx-books/file1.md": {
      "title": "lol1",
      "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/next-mdx-books/main/testData/file1.md",
      "ghUrl": "https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/file1.md",
      "route": "Open-EdTech/next-mdx-books/file1.md",
      "index": 0,
      "treePath": [0],
      "next": { "title": "lol2", "route": "Open-EdTech/next-mdx-books/file2.md" }
    },
    "Open-EdTech/next-mdx-books/file2.md": {
      "title": "lol2",
      "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/next-mdx-books/main/testData/file2.md",
      "ghUrl": "https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/file2.md",
      "route": "Open-EdTech/next-mdx-books/file2.md",
      "index": 0,
      "treePath": [1],
      "prev": { "title": "lol1", "route": "Open-EdTech/next-mdx-books/file1.md" }
    }
  })
});
