# About 

## Motivations

This library helps you make a book from `.mdx` and `.md` files on GitHub. 

`mdxbook` has nothing to do with the user interface, which is why this website is ugly. We give the user total freedom for structuring their front end. In jargon, GitHub as a headless CMS.

`mdxbook` helps you use Markdown as a configuration file for content hosted on GitHub. Here is a small collection of books from various sources that we are able to host using the software.

The cat picture in the side navigation will take you to the page on GitHub, where you can click the star button in the top right corner.

## Introduction

The following markdown file is from a <a target="_blank" rel="noopener noreferrer" href="https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/TOC.md">GitHub repository</a>

```markdown
# Title

* directory
  * [file1](file1.md)
* **separator**
* [file2](file2.md)
* [fullUrl](https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/file2.md)
```

Within the testData directory there are also files `file1.md` and `file2.md`. We convert this markdown file into a richer and easier to use JSON format below.

Here are some observations about the generated object:

* Nodes contain a `ghUrl` with the location of the file on GitHub, as well as a `rawUrl` that contains 
the location of a URL serving the raw text content of the Markdown.
* A `path` property exists for all files with links that are relative paths. This allows for local development workflows when authoring contents.
* Nodes of type `file` contain information about the front matter block, and the headings contained in the file. The user is able to define custom functions that process the markdown files.

```json
{
  "type": "directory",
  "title": "Title",
  "children": [
    {
      "type": "directory",
      "title": "directory",
      "children": [
        {
          "type": "file",
          "route": "Open-EdTech/next-mdx-books/file1.md",
          "title": "file1",
          "path": "/Users/matthewcaseres/Documents/GitHub/next-mdx-books/testData/file1.md",
          "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/next-mdx-books/main/testData/file1.md",
          "ghUrl": "https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/file1.md",
          "headers": [
            {
              "title": "h2 1",
              "route": "Open-EdTech/next-mdx-books/file1.md/#h2-1",
              "type": "heading"
            },
            {
              "title": "h2 2",
              "route": "Open-EdTech/next-mdx-books/file1.md/#h2-2",
              "type": "heading"
            }
          ],
          "frontMatter": { "lol": "what?" },
        }
      ],
    },
    { "type": "separator", "title": "separator" },
    {
      "type": "file",
      "route": "Open-EdTech/next-mdx-books/file2.md",
      "title": "file2",
      "path": "/Users/matthewcaseres/Documents/GitHub/next-mdx-books/testData/file2.md",
      "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/next-mdx-books/main/testData/file2.md",
      "ghUrl": "https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/file2.md",
      "headers": [
        {
          "title": "h2 1",
          "route": "Open-EdTech/next-mdx-books/file2.md/#h2-1",
          "type": "heading"
        },
        {
          "title": "h2 2",
          "route": "Open-EdTech/next-mdx-books/file2.md/#h2-2",
          "type": "heading"
        }
      ],
    },
    {
      "type": "file",
      "route": "Open-EdTech/next-mdx-books/testData/file2.md",
      "title": "fullUrl",
      "ghUrl": "https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/file2.md",
      "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/next-mdx-books/main/testData/file2.md",
      "headers": [
        {
          "title": "h2 1",
          "route": "Open-EdTech/next-mdx-books/testData/file2.md/#h2-1",
          "type": "heading"
        },
        {
          "title": "h2 2",
          "route": "Open-EdTech/next-mdx-books/testData/file2.md/#h2-2",
          "type": "heading"
        }
      ]
    }
  ]
}
```

* Includes fields for the GitHub page and the raw.githubusercontent page for all links in the Table of Contents.
* Support for relative paths and fulll URLS in the TOC.
* Use local files for offline workflows.
* User defined functions for modifying nodes in the tree on the basis of their associated markdown file.



```js
//Let the user add a function
const userFunction = (node, { mdast, FrontMatte }) => {
  const routePrefix = node.route;
  var slugger = new GithubSlugger();
  let headers = [];
  visit(mdast, 'heading', (mdNode) => {
    if (mdNode.depth === 2) {
      let header = {};
      header.title = mdNode.children[0].value;
      header.route = routePrefix + '/#' + slugger.slug(header.title);
      header.type = 'heading';
      headers.push(header);
    }
  });
  node.content = headers;
};

test('Constructs valid URL tree', async () => {
  const result = await summaryToUrlTree({
    url:
      'https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/TOC.md',
    localPath: path.join(__dirname, '..', 'testData', 'TOC.md'),
    userFunction: (node, {mdast, frontMatter}) => {
      // Given a reference to node, what modifications should be made using the 
      // AST of the markdown file, and the frontmatter object
      node.mdast = mdast
      node.frontMatter = frontMatter
    },
    rawProvider: 'https://raw.githubusercontent.com',
  });
  fs.writeFileSync('hmm.json', JSON.stringify(result));

  expect(result).toEqual(JSON00);
});
```

## lol

kjhhkjhkj