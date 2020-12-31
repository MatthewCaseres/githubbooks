import summaryToUrlTree from '../src/makeConfig/summaryToUrlTree';
import JSON00 from '../testData/00-JSON.json'

test('Constructs valid URL tree', async () => {
  const result = await summaryToUrlTree(
    {
      url:
        'https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/TOC.md',
    },
    'https://raw.githubusercontent.com'
  );

  expect(result).toEqual(JSON00);
});