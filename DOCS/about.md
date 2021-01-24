---
frontMatter: You put metadata about pages in the front matter
updatedAt: January 24, 2021
---

# About 

## Motivations

This library helps you make a book from `.mdx` and `.md` files on GitHub. 

`mdxbook` has nothing to do with user interfaces and is independent of any JavaScrip framework. `mdxbook` helps you use Markdown as a configuration file for content hosted on GitHub.

Although this package is simply a markdown parser/formatter, it can be powerful when combined with technologies like MDX and Next.js. Markdown files from any public repository on GitHub can be turned into books, even repositories that you don't have permissions in. This is accomplished by requesting the raw text from GitHub, like this - https://raw.githubusercontent.com/twbs/bootstrap/main/README.md. This text is used at build time by next-mdx-remote to build a static site.

## Overview

This file is from our <a target="_blank" rel="noopener noreferrer" href="https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/TOC.md">test cases</a>.

```markdown
# Title

* directory
  * [file1](file1.md)
* **separator**
* [file2](file2.md)
* [fullUrl](https://github.com/Open-EdTech/next-mdx-books/blob/main/testData/file2.md)
```

Here are some observations about the generated object:

* Nodes contain a `ghUrl` with the location of the file on GitHub, as well as a `rawUrl` that contains 
the location of a URL serving the raw text content of the Markdown.
* A `path` property exists for all files with links that are relative paths. This allows for local development workflows when authoring contents.
* Nodes of type `file` contain information about the front matter block, and the headings contained in the file. The user is able to define custom functions that modify nodes on the basis of file contents.

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

Read our documentation on generating configurations for more details.