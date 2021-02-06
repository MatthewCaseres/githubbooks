# github-books

## Installation
```
yarn add github-books
#or
npm install github-books
```

## About

This library helps you make a book from `.mdx` and `.md` files on GitHub. `mdxbook` has nothing to do with user interfaces and is independent of any JavaScript framework.

We take a table of contents that is written in Markdown and parse it to a JSON format that helps you use GitHub as a headless CMS. In less technical terms, we help you give your reader a good experience whether they read your content directly on GitHub or on your own custom platform.

A major selling point is that we are compatible with existing GitBooks. We hope this configuration can become a standard and everything will be interoperable. Like EPUB for the Markdown era.

## Basic Demonstration

We take a file that has a markdown table of contents. Notice that we support both relative paths and full GitHub URLs. You can use content from other people's repositories by simply adding the URL.

```markdown
# Title of Book

* [Study 1](study-guide.md)
* [Study 2](https://github.com/MatthewCaseres/mdExperiments/blob/main/study-guide.md)
```

This file renders in a nice way on GitHub, and you can use GitHub to read the contents even without building your own web application.

![](https://user-images.githubusercontent.com/43053796/107092690-a6d50d80-67c9-11eb-93b2-fcfc0b0b970a.png)

You can generate a configuration file and save the JSON to a file.

```js
var { summaryToUrlTree } = require("github-books");
var fs = require('fs');

(async () => {
  const config = await summaryToUrlTree({
    url: "https://github.com/MatthewCaseres/mdExperiments/blob/main/config.md",
    localPath: "/Users/matthewcaseres/Documents/GitHub/mdExperiments/config.md",
  });
  fs.writeFileSync('config.json', JSON.stringify(config))
})()
```

Here are some observations about the generated object:

* Nodes contain a `ghUrl` with the location of the file on GitHub, as well as a `rawUrl` that contains the location of a URL serving the raw text content of the Markdown.
* A `path` property exists for all files with links that are relative paths. This allows for local development workflows when authoring contents.

```json
{
  "type": "root",
  "children": [
    {
      "type": "file",
      "route": "MatthewCaseres/mdExperiments/study-guide.md",
      "title": "Study 1",
      "path": "/Users/matthewcaseres/Documents/GitHub/mdExperiments/study-guide.md",
      "rawUrl": "https://raw.githubusercontent.com/MatthewCaseres/mdExperiments/main/study-guide.md",
      "ghUrl": "https://github.com/MatthewCaseres/mdExperiments/blob/main/study-guide.md",
      "treePath": [0]
    },
    {
      "type": "file",
      "route": "MatthewCaseres/mdExperiments/study-guide.md",
      "title": "Study 2",
      "ghUrl": "https://github.com/MatthewCaseres/mdExperiments/blob/main/study-guide.md",
      "rawUrl": "https://raw.githubusercontent.com/MatthewCaseres/mdExperiments/main/study-guide.md",
      "treePath": [1]
    }
  ],
  "title": "Title of Book",
  "treePath": []
}
```

## User Functions

Users can write custom functions. The user is given the AST for the markdown file in `mdast`, and the front matter in `frontMatter`. Modifications can be made for each node of type `file` on the basis of it's abstract syntax tree.

The unified ecosystem is basically about turning text into JSON (abstract syntax trees to be precise). If you want to see what an Abstract Syntax Tree for your markdown document looks like you can go to the AST explorer. Mess around with this.

https://astexplorer.net/#/gist/2effedb015f5929d9a63398a6634370f/6a90ae4d41d5b92c28c623523d883f6a518ee8de

Run the code below to see that we can grab information from inside the markdown files and make modifications to the generated configuration. The logs actually repeat, because our configuration has two list items that point to the same location.

Remember to run `yarn add unist-util-visit`. This is a utility built by the unified.js people, whose work allows us to do all that we are doing. Having a good idea of the unified ecosystem will really help you when working with Markdown, check them out at https://unifiedjs.com/.

```js
var {summaryToUrlTree} = require('github-books');
var fs = require('fs');
var visit = require('unist-util-visit');

(async () => {
  const docsTree = await summaryToUrlTree({
    url: "https://github.com/MatthewCaseres/mdExperiments/blob/main/config.md",
    userFunction: (node, {mdast, frontMatter}) => {
      // You could collect information about headings and add it to the tree
      visit(mdast, 'heading', (mdNode) => {
        console.log('Heading Node', mdNode)
      })
      //Or use the frontMatter
      console.log('frontMatter', frontMatter)
      //But instead we just laugh
      node.lol = "lol"
    }
  })
  console.log("docsTree", docsTree)
})()
```

## Consuming Generated JSON

Use the `rawUrl` field from tree nodes to fetch text data and use GitHub as a headless CMS. You can do this however you want, but we have a template for Next.js.

```
npx create-next-app -e https://github.com/Open-EdTech/github-books-template
# or
yarn create next-app -e https://github.com/Open-EdTech/github-books-template
```


