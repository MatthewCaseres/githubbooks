import getGhRawUrl from '../src/makeConfig/getGhRawUrl';

test('works for FP guide (root config, same level)', () => {
    const {ghPrefix, rawPrefix, full_name, rawSummaryUrl} = getGhRawUrl("https://github.com/MatthewCaseres/mostly-adequate-guide/blob/master/SUMMARY.md",
    "https://raw.githubusercontent.com",
    );
    expect(ghPrefix).toBe('https://github.com/MatthewCaseres/mostly-adequate-guide/blob/master/');
    expect(rawPrefix).toBe('https://raw.githubusercontent.com/MatthewCaseres/mostly-adequate-guide/master/');
    expect(full_name).toBe('MatthewCaseres/mostly-adequate-guide');
    expect(rawSummaryUrl).toBe('https://raw.githubusercontent.com/MatthewCaseres/mostly-adequate-guide/master/SUMMARY.md');
});

test('works for next-mdx-books DOCs (not root config, same level)', () => {
    const {ghPrefix, rawPrefix, full_name, rawSummaryUrl} = getGhRawUrl("https://github.com/Open-EdTech/next-mdx-books/blob/main/DOCS/DOCS.md",
    "https://raw.githubusercontent.com",
    );
    expect(ghPrefix).toBe('https://github.com/Open-EdTech/next-mdx-books/blob/main/DOCS/');
    expect(rawPrefix).toBe('https://raw.githubusercontent.com/Open-EdTech/next-mdx-books/main/DOCS/');
    expect(full_name).toBe('Open-EdTech/next-mdx-books');
    expect(rawSummaryUrl).toBe('https://raw.githubusercontent.com/Open-EdTech/next-mdx-books/main/DOCS/DOCS.md');
});
