
# Generate Configuration JSON

The `summaryToUrlTree` method takes in the location of a Markdown configuration file and lets you transform it to a JavaScript object.

## Get Started

Make an empty node.js project and install `mdxbook`.

```
mkdir mdxbook-tutorial && cd mdxbook-tutorial 
yarn init -y 
yarn add mdxbook
```

Now you need to find a configuration file on GitHub. Let's use the configuration file for this documentation, https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/DOCS.md.

## URL Tree Basics

Make a file `script.js` containing the code below.

```js
var {summaryToUrlTree} = require('mdxbook');
var fs = require('fs');

(async () => {
  const docsTree = await summaryToUrlTree({
    url: "https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/DOCS.md"
  })
  fs.writeFileSync('bookConfig.json', JSON.stringify(docsTree))
})()
```

The url referenced contains the following Markdown file:

```md
# docs

* [About](about.md)
* [Generate Configurations](generate.md)
```

After running the code via `node script.js` we see that a new file, `bookConfig.json` is created. 

```json
{
  "type": "root",
  "children": [
    {
      "type": "file",
      "route": "Open-EdTech/mdxbook/about.md",
      "title": "About",
      "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/mdxbook/main/DOCS/about.md",
      "ghUrl": "https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/about.md",
      "treePath": [0]
    },
    {
      "type": "file",
      "route": "Open-EdTech/mdxbook/generate.md",
      "title": "Generate Configurations",
      "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/mdxbook/main/DOCS/generate.md",
      "ghUrl": "https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/generate.md",
      "treePath": [1]
    }
  ],
  "title": "docs",
  "treePath": []
}
```

This is called a "URL tree", a tree that specifies locations of resources. 

* `type` is used to distinguish between different types of nodes
* `route` is used as a route
* `title` is the name of the page as it should appear in navigation
* `rawUrl` is where we fetch text data for build processes in our static site
* `ghUrl` is the page on GitHub for an "Edit on GitHub" button. 
* `treePath` specifies the location of a node in the tree.

This is fundamentally what the software does, it is up to the user to implement a user interface. You can  use the source code of this website as a starting point.

## Arbitrary Repositories

Our previous example used relative paths for links, this way of specifying links only allows for configuration files that live in the same repository as the content they reference. You may want to host markdown files from a GitHub repository that you do not own, and that does not have an `mdxbook` compatible configuration file.

In this case you could certainly make a fork, but you don't need to. We support specifying full GitHub urls in our markdown configs.

This - 

```md
# docs

* [About](about.md)
```

is equivalent to this - 

```md
# docs

* [About](https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/about.md)
```

Using full urls you can specify books with content that is from arbitrary repositories on GitHub.

## Local Development

If you are writing content and do not want to push to GitHub (and wait for raw.githubusercontent to repopulate) to preview this content, we provide a method for the computation of local paths to resources. This way you can use local content when developing locally.

Inside of the `summaryToUrlTree` method we add the path to our local copy of the repository.

```js
(async () => {
  const docsTree = await summaryToUrlTree({
    url: "https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/DOCS.md",
    localPath: "/Users/matthewcaseres/Documents/GitHub/mdxbook/DOCS/DOCS.md"
  })
  fs.writeFileSync('bookConfig.json', JSON.stringify(docsTree))
})()
```

Rerunning `node script.js` yields a new URL tree with a local path. 

```json
{
  "type": "directory",
  "children": [
    {
      "type": "file",
      "route": "Open-EdTech/mdxbook/about.md",
      "title": "About",
      "path": "/Users/matthewcaseres/Documents/GitHub/mdxbook/DOCS/about.md",
      "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/mdxbook/main/DOCS/about.md",
      "ghUrl": "https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/about.md",
      "treePath": [0]
    },
    {
      "type": "file",
      "route": "Open-EdTech/mdxbook/generate.md",
      "title": "Generate Configurations",
      "path": "/Users/matthewcaseres/Documents/GitHub/mdxbook/DOCS/generate.md",
      "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/mdxbook/main/DOCS/generate.md",
      "ghUrl": "https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/generate.md",
      "treePath": [1]
    }
  ],
  "title": "docs",
  "treePath": []
}
```

## User Functions

We provide an option for the customization of URL tree nodes of type `file`. The user is given the AST for the markdown file in `mdast`, and the front matter in `frontMatter`. Modifications can be made to the node `node` using these passed in properties.

First run `yarn add unist-util-visit`. This is a utility built by the unified.js people, whose work allows us to do all that we are doing. Having a good idea of the unified ecosystem will really help you when working with Markdown.

The unified ecosystem is basically about building abstract syntax trees for content, things like HTML and Markdown. If you want to see what an Abstract Syntax Tree for your markdown document looks like you can go to the AST explorer.

```js
var {summaryToUrlTree} = require('mdxbook');
var fs = require('fs');
var visit = require('unist-util-visit');

(async () => {
  const docsTree = await summaryToUrlTree({
    url: "https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/DOCS.md",
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
  fs.writeFileSync('bookConfig.json', JSON.stringify(docsTree))
})()
```

You should see the logged information. `bookConfig.json` will also have our new `lol` property. 

```json
{
  "type": "directory",
  "children": [
    {
      "type": "file",
      "route": "Open-EdTech/mdxbook/about.md",
      "title": "About",
      "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/mdxbook/main/DOCS/about.md",
      "ghUrl": "https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/about.md",
      "lol": "laugh out loud",
      "treePath": [0]
    },
    {
      "type": "file",
      "route": "Open-EdTech/mdxbook/generate.md",
      "title": "Generate Configurations",
      "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/mdxbook/main/DOCS/generate.md",
      "ghUrl": "https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/generate.md",
      "lol": "laugh out loud",
      "treePath": [1]
    }
  ],
  "title": "docs",
  "treePath": []
}
```

This is possible because we give users a reference to the `node` object, which is mutable. `mdxbook` will iterate over the nodes that have associated markdown files, read them, parse them into their front matter and AST, and provide these things to the user for modifying the URL tree.

## Multiple Books

Because it is time consuming to generate the configuration, we recommend saving the result of `summaryToUrlTree` to a file and regenerating it when needed as in the above demos.

You can scale the number of books easily by writing to an array of URL trees. In your script file change `JSON.stringify(docsTree)` to `JSON.stringify([docsTree])`, rerun the script. Your configuration file is now compatible with the `getAllRoutesInfo` method for consuming configuration files

