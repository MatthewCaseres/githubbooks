import summariesToTrees from '../src/prebuild/summariesToTrees';

test('adds 1 + 2 to equal 3', async () => {
  await summariesToTrees([
    {
      url:
        'https://github.com/MostlyAdequate/mostly-adequate-guide/blob/master/SUMMARY.md',
    },
  ]);
  expect(1 + 2).toBe(3);
});
