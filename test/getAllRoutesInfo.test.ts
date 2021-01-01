import { getAllRoutesInfo } from '../src/getStatic';
import jsons from '../testData/00-JSONs.json'

test('works for FP guide (root config, same level)', () => {
  const res = getAllRoutesInfo(jsons);
  expect(res).toEqual({
    'Open-EdTech/next-mdx-books/file1.md': {
      rawUrl: 'https://raw.githubusercontent.com/Open-EdTech/next-mdx-books/main/testData/file1.md',
      ghUrl: 'https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/file1.md',
      route: 'Open-EdTech/next-mdx-books/file1.md',
      path: undefined,
      index: 0,
      treePath: [ 0 ]
    },
    'Open-EdTech/next-mdx-books/file2.md': {
      rawUrl: 'https://raw.githubusercontent.com/Open-EdTech/next-mdx-books/main/testData/file2.md',
      ghUrl: 'https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/file2.md',
      route: 'Open-EdTech/next-mdx-books/file2.md',
      path: undefined,
      index: 0,
      treePath: [ 1 ]
    }
  })
});
